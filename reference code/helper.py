import streamlit as st
import os
import base64
import time
from openai import OpenAI
from langsmith.wrappers import wrap_openai
from langsmith import traceable
from supabase import create_client, Client

from langchain_openai import OpenAIEmbeddings, ChatOpenAI


# OPENAI LOG관련 -LANGSMITH 설정
os.environ["LANGCHAIN_TRACING_V2"] = st.secrets["LANGCHAIN_TRACING_V2"]
os.environ["LANGCHAIN_ENDPOINT"] = st.secrets["LANGCHAIN_ENDPOINT"]
os.environ["LANGCHAIN_PROJECT"] = st.secrets["LANGCHAIN_PROJECT"]
os.environ["LANGCHAIN_API_KEY"] = st.secrets["LANGCHAIN_API_KEY"]

# 데이터베이스 연결 관련 - Supabase 설정
@st.cache_resource
def init_connection():
    url: str = st.secrets["SUPABASE_URL"]
    key: str = st.secrets["SUPABASE_KEY"]
    supabase: Client = create_client(url, key)
    return supabase

supabase = init_connection()

# OpenAI 클라이언트
client = wrap_openai(OpenAI(api_key=st.secrets["OPENAI_API_KEY"]))
langchain_client = ChatOpenAI(model = "gpt-4o-mini", api_key=st.secrets["OPENAI_API_KEY"])

# 임베딩 모델 선언
openai_embedding_model = "text-embedding-3-small"
openai_embedding = OpenAIEmbeddings(model=openai_embedding_model, api_key=st.secrets["OPENAI_API_KEY"])

collection_name = "ocuguide_chromadb"
ocuguide_path = "./db/ocuguide_chromadb/"

# persist_db = Chroma(
#     persist_directory = ocuguide_path,
#     embedding_function=OpenAIEmbeddings(),
#     collection_name=collection_name
# )
# retriever = persist_db.as_retriever()

# 음성 파일의 자동 재생
def autoplay_audio(file_path: str):
    with open(file_path, "rb") as f:
        data = f.read()
        b64 = base64.b64encode(data).decode()
        md = f"""
            <audio controls autoplay="true">
            <source src="data:audio/mp3;base64,{b64}" type="audio/mp3">
            </audio>
            """
        st.markdown(
            md,
            unsafe_allow_html=True,
        )

# 오디오 정지 함수
def stop_audio():
    st.markdown("""
    <script>
    var audio = document.getElementById('audio-player');
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }
    </script>
    """, unsafe_allow_html=True)

def stream_partial_data(text):
    full_text = ""
    for char in text:
        full_text += f'<span style="color:red; font-size:2vh;">{char}</span>'
        yield full_text
        time.sleep(0.1)

# 환자 정보에 맞는 진단
@traceable
def diagnosis_draft(msg):
    messages = [
        {"role": "system", 
         "content": 
         """당신은 백내장 수술 경험이 많은 안과 전문의 입니다.
         지금부터 환자의 최초 검진결과로부터 환자의 상태를 진단하고, 이에 대한 종합소견을 밝힙니다.
         최초 검진은 다음 여섯개의 항목으로 분류됩니다.
         #1.전안부 이상, #2.각막 이상, #3.전방 이상, #4. 수정체 이상, #5.망막 이상, #6.시신경 이상

         아래의 기준에 따라서 소견을 밝힐 수 있습니다.
         1) 어떤 항목도 검진되지 않았을 경우
         ### {환자이름}님께서는 백내장 수술의 위험성이 낮고, 합병증 발생 가능성이 높지 않은 상태입니다.

         2) "전안부 이상" 항목만 검진되었을 경우
         ### {환자이름}님께서는 백내장 수술의 위험성이 낮고, 합병증 발생 가능성이 높지 않은 상태입니다. 하지만 수술 후 건성안 증상이 악화될 수 있어 이에 대한 지속적인 관리가 필요합니다.

         3) 기타 항목이 검진되었을 경우
         ### {환자이름}님께서는 일반적인 경우와 비교하여 OOO의 위험요인(들)을 추가로 가지고 있는 상태입니다. 저희 세브란스 안과 병원 의료진은 이러한 위험요인(들)을 충분히 숙지하고 준비하겠습니다.

         지금부터 아래의 지시사항에 따라서, 답변을 생성합니다.
         #지시사항(instructions)
        1. 환자가 불안하지 않도록 친절하게 답변합니다.
        2. 위의 기준이 중복되었을 경우에는, 가장 위험도가 높은 상태를 기준으로 답변을 만듭니다.
        3. 답변의 맨 뒤에는 다음과 같은 문장을 덧붙입니다.
           ### 수술 시에는 불가항력적인 상황이 발생할 수 있지만, 저희 세브란스 안과 병원 의료진은 {환자이름}님께서 최고의 결과를 얻을 수 있도록 최선의 노력을 다하겠습니다. ###
        4. {환자이름}에는 함께 입력된 환자 이름을 사용합니다.
        5. 위의 기준 이외에 함께 제공된 나이와 수술 부위에 대한 당신의 생각을 덧붙여주세요.
        """}]

    messages.append(msg)
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages
    )
    return response.choices[0].message.content

@traceable
def diagnosis_draft_2(msg):
    messages = [
        {"role": "system", 
         "content": 
         """당신은 백내장 수술 경험이 많은 안과 전문의 입니다.
         지금부터 환자의 최초 검진결과로부터 환자의 상태를 진단하고, 이에 대한 종합소견을 밝힙니다.
         최초 검진은 다음 여섯개의 항목으로 분류됩니다.
         #1.전안부, #2.각막, #3.전방, #4. 수정체, #5.망막, #6.시신경

         아래의 기준에 따라서 소견을 밝힐 수 있습니다.
         1) 어떤 항목도 검진되지 않았을 경우
         ### {환자이름}님께서는 백내장 수술의 위험성이 낮고, 합병증 발생 가능성이 높지 않은 상태입니다.

         2) "전안부" 항목만 검진되었을 경우
         ### {환자이름}님께서는 백내장 수술의 위험성이 낮고, 합병증 발생 가능성이 높지 않은 상태입니다. 하지만 수술 후 건성안 증상이 악화될 수 있어 이에 대한 지속적인 관리가 필요합니다.
         
         3) "망막" 또는 "시신경" 항목이 검진되었을 경우
         ### {환자이름}님께서는 백내장 수술의 위험성이 낮고, 합병증 발생 가능성이 높지 않은 상태입니다.
         하지만 수술 후에도 #'망막' 또는 '시신경' 질환으로 인해 시력호전에 제한이 있을 수 있습니다.

         4) "각막" 항목이 검진되었을 경우
         ### {환자이름}님께서는 일반적인 경우와 비교하여 각막관련 위험요인(들)을 추가로 가지고 있는
         상태입니다. 따라서 백내장 수술 후에도 각막질환으로 인해 시력호전에 제한이 있을 수 있습니다.
         4-1) 하위항목에 "내피세포"가 포함된 경우
         각막내피세포의 저하로 수술 이후 각막부종이 나타날 수 있으며, 이로인한 시력저하가 지속될 시
         각막 이식술을 고려할 수 있습니다.

         5) "전방" 또는 "수정체" 항목이 검진되었을 경우
         ### {환자이름}님께서는 일반적인 경우와 비교하여 #'전방 또는 수정체'# 위험요인(들)을 추가로 가지고 있는
         상태입니다. 따라서 백내장 수술의 난이도가 높고 수술의 범위가 커질 가능성이 있습니다.
         5-2) 하위항목에 "심한 백내장"이 포함된 경우
         심한 백내장을 제거하는 과정에서 나타나는 각막부종으로 인한 시력호전에 제한이 있을 수 있습니다.
    
         지금부터 아래의 지시사항에 따라서, 답변을 생성합니다.
         #지시사항(instructions)
        1. 환자가 불안하지 않도록 친절하게 답변합니다.
        2. 검진 기준의 번호가 클수록 위험도가 높은 상태입니다. 위험한 상태를 기준으로 답변을 만듭니다. 
            위험한 항목이 검진되었음에도, 위험성을 낮게 진단해서는 절대 안됩니다. 중복된 내용 중 세부사항은 최대한 포함합니다.
        3. 답변의 맨 뒤에는 다음과 같은 문장을 덧붙입니다.
           ### 수술 시에는 불가항력적인 상황이 발생할 수 있지만, 저희 세브란스 안과 병원 의료진은 {환자이름}님께서 최고의 결과를 얻을 수 있도록 최선의 노력을 다하겠습니다. ###
        4. {환자이름}에는 함께 입력된 환자 이름을 사용합니다.
        5. 함께 제공된 환자정보에서 나이와 수술 부위에 대한 당신의 생각을 덧붙여주세요. 특히, 나이에 따른 회복정도, 주의사항 등을 추가합니다.
        6. 현재와 수술 날짜까지의 기간을 밝힙니다. 이 때,##[한달전, 일주일전, 당일]##로 구간을 나눈 후, 해당되는 기간이 있을 경우, 각각의 기간에 주의사항 및 수술을 위해 준비할 사항을 추가합니다. 
        """}]

    messages.append(msg)
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages
    )
    return response.choices[0].message.content

def speech_to_text(audio_data):
    with open(audio_data, "rb") as audio_file:
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            response_format="text",
            file=audio_file
        )
    return transcript

def text_to_speech(input_text, webm_file_path):
    response = client.audio.speech.create(
        model="tts-1",
        voice="nova",
        input=input_text
    )
    # webm_file_path = "temp_audio_play.mp3"
    with open(webm_file_path, "wb") as f:
        response.write_to_file(webm_file_path)
    return webm_file_path