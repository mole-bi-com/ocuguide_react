import streamlit as st
from openai import OpenAI
# from helper import client, langchain_client, retriever
from helper import client
from langsmith import traceable
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone.grpc import PineconeGRPC as Pinecone

openai_embedding_model = "text-embedding-3-small"
# os.environ["OPENAI_API_KEY"] = st.secrets["OPENAI_API_KEY"]
embeddings = OpenAIEmbeddings(model=openai_embedding_model, api_key=st.secrets["OPENAI_API_KEY"])
embed_dim = 1536

# Client 생성
pc = Pinecone(api_key=st.secrets["PINECONE_API_KEY"])
index_name = "ocuguide"
index = pc.Index(index_name)
vector_store = PineconeVectorStore(index=index, embedding=embeddings)

def augment_prompt(query: str):
    results = vector_store.similarity_search(query, k=1)
    source_knowledge = "\n".join([x.page_content for x in results])
    
    augmented_prompt = f"""당신은  백내장 수술 경험이 풍부한 안과전문의입니다.
    지금부터 지시사항(instruction)을 지키며 백내장 수술을 앞둔 환자의 질문에 답변을 합니다.
    질문(question)에 관련있는 문맥(context)을 반드시 이용하여 답변을 생성합니다. 
    
    # context:
    {source_knowledge}

    # question: {query}"""
    return augmented_prompt

@traceable
def page_w_rag():
    st.title("❓ Q&A 챗봇 [OcuGuide]")

    with st.container(border=True):
        st.write("- :green[**OcuGUIDE**]에서 궁금했던 내용을 무엇이든 물어보세요.")
        st.write("- OcuGUIDE는 세브란스 안과병원의 백내장 수슬 경험과 지식을 학습합니다.")
        st.write("- 이해가 어려웠던 내용을 보다 전문적인 OcuGUIDE 챗봇이 성심껏 답변드립니다.")
        st.write("- 질문이 끝나신 후, 이제 곧 만나실 주치의에게 추가 질문과 설명을 들을 수 있습니다.")

    if "openai_model" not in st.session_state:
        st.session_state["openai_model"] = "gpt-4o-mini"
    
    
    # prompt = PromptTemplate.from_template(
    #     """당신은  백내장 수술 경험이 풍부한 안과전문의입니다. 
    #     지금부터 지시사항(instruction)을 지키며 백내장 수술을 앞둔 환자의 질문에 답변을 합니다.
    #     질문(question)에 관련있는 문맥(context)을 반드시 이용하여 답변을 생성합니다. 
    #     #Question:
    #     {question}
    #     #Context:
    #     {context}""")
    
    # chain = (
    #     {"context": retriever, "question": RunnablePassthrough()}
    #     | prompt
    #     | langchain_client
    #     | StrOutputParser()
    #     )

    # 다른 세션 키로 대화를 저장한다.
    if "rag_messages" not in st.session_state or st.session_state["rag_messages"] == None:
        initial_messages = [
            {"role": "system", 
            "content": 
            """당신은 백내장 수술 경험이 많은 안과 전문의 입니다.
            지금부터 당신은 백내장 수술에 관한 환자의 질문에 대답합니다.
            이 때, 반드시 아래의 지시사항에 따라서 답변을 생성합니다.
            #지시사항(instructions)
            1. 답변은 반드시 의학적 사실에 기반을 두어야하고, 근거가 없는 사실을 만들어내서는 안됩니다.
            2. 반드시 사용자의 질문(Question)에 관련된 문맥(Context)을 반영하여야 합니다.
            3. 답변은 정확하고 핵심이 분명하면서도, 환자들이 불안하지 않도록 친절하게 답변합니다.
            4. 우선, 당신만의 답변을 만들 후에, 일반인이 이해할 수 있는 수준으로 대답을 정리합니다. 이 때, 어려운 용어는 설명을 짧게 덧붙입니다.
            5. 백내장 수술이나 안과와 관련이 없는 질문에는 대답할 수 없다고 말합니다.
            """}]
        initial_messages.append({
            "role": "assistant",
            "content": "안녕하세요. 백내장의 모든것 OcuGUIDE 입니다."
        })
        st.session_state.rag_messages = initial_messages

    for message in st.session_state.rag_messages[1:]:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])
    
    if question := st.chat_input("궁금한 사항을 물어봐주세요."):
        st.session_state.rag_messages.append({"role": "user", "content": question})
        with st.chat_message("user"):
            st.markdown(question)
        
        with st.chat_message("assistant"):
            context_msgs = [
                    {"role": m["role"], "content": m["content"]}
                    for m in st.session_state.rag_messages
                ][:-1]
            current_query = augment_prompt(question)
            # print(current_query)
            context_msgs.append({"role": "user", "content": augment_prompt(question)})
            stream = client.chat.completions.create(
                model=st.session_state["openai_model"],
                messages=context_msgs,
                stream=True,
            )
            response = st.write_stream(stream)
        st.session_state.rag_messages.append({"role": "assistant", "content": response})

    #     with st.chat_message("assistant"):
    #         with st.spinner('OcuGUIDE가 답변을 생성 중입니다...'):
    #             response = chain.invoke(question)
    #         st.markdown(response)
    #     st.session_state.rag_messages.append({
    #         "role": "assistant",
    #         "content": response 
    #     })