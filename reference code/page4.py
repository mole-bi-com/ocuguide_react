import streamlit as st
from openai import OpenAI
from helper import client, text_to_speech, speech_to_text
from langsmith import traceable
from audio_recorder_streamlit import audio_recorder
import random
import os
import time
from helper import autoplay_audio

def stream_data(script):
    for word in script.split(" "):
        yield word + " "
        time.sleep(0.02)

@traceable
def page_w_chatgpt():
    st.title("❔ Q&A 챗봇")

    with st.container(border=True):
        c1, c2 = st.columns([7, 1])
        with c1:
            st.write("""
                    - :blue[**OcuGUIDE**]에서 궁금했던 내용을 무엇이든 물어보세요.
                    - ℹ️ 백내장수술정보에서 어려웠던 내용을 챗봇이 성심껏 답변드립니다.
                    - 오른쪽의 마이크를 누르면, 음성으로 질문할 수 있습니다.
                    - 질문이 끝나신 후, 이제 곧 만나실 주치의에게 추가 설명을 들을 수 있습니다.
                    """)
            autoplay_audio("./ref/contents/chat_guide.mp3")
        with c2:
            audio_bytes = audio_recorder(text="음성모드", neutral_color="#6aa36f", icon_size="4x")
        
        # st.write("- :blue[**OcuGUIDE**]에서 궁금했던 내용을 무엇이든 물어보세요.  \n")
        # st.write("- 이해가 어려웠거나, 다시 듣고 싶으신 내용을 챗GPT 에이전트가 성심껏 답변드립니다.  \n")
        # st.write("- 질문이 끝나신 후, 이제 곧 만나실 주치의에게 추가 질문과 설명을 들을 수 있습니다.")
    
    # with st.container(border=True):
    #     speak, listen = st.columns([1, 1])
    #     with speak:
    #         st.write("### 음성 도움 안내 ###")
    #     audio_bytes = audio_recorder()

    with st.container(border=True):
        c1, c2, c3 = st.columns([1, 1, 1])
        with c1:
            r1_txt = "백내장이란?"
            r1_answer = """
            백내장은 주로 노화가 진행되면서 수정체를 구성하는 조직이 변성되며 생기는 질환입니다.  
            백내장은 크게 선천성 백내장과 후천성 백내장으로 구분합니다. 선천성 백내장은 백내장을 갖고 태어나거나 태어난 지 얼마 되지 않아 백내장이 발생하는 것을 말합니다.  
            후천성 백내장은 노화가 진행됨에 따라 생기는 백내장으로, 수정체에서 발생하는 부위에 따라 중앙을 흐리게 하는 핵백내장, 테두리를 흐리게 하는 피질백내장, 수정체 뒤쪽을 흐리게 하는 후낭하백내장으로 구분합니다.  
            젊은 층에서는 외상에 의한 백내장 발생이 흔하며, 보통 한쪽 눈에만 생깁니다.  
            눈이 무언가에 찔리거나 둔기로 맞아서 또는 강력한 자외선을 받아 백내장이 생길 수 있습니다.  
            이외에도 당뇨병이나 크레틴병과 같은 호르몬질환, 근긴장성 이영양증, 아토피와 같은 전신성 질환에 의해서도 백내장이 유발될 수 있습니다.
            """
            r1 = st.button(r1_txt, key='r1', use_container_width=True)
        with c2:
            r2_txt = "백내장의 증상"
            r2_answer = """
            초기 백내장은 별다른 증상이 나타나지 않지만, 시간이 지나 병이 진행하면서 시야가 흐려지고 색감이 덜 선명하게 보일 수 있습니다.  
            병이 더욱 진행하면 시력 손상이 나타납니다.  
            밤에 앞이 잘 보이지 않거나 전등의 불빛이 매우 강한 빛인 것처럼 보이기도 하며, 빛 주변에 무지개가 보이거나 뿌옇게 무리가 보이기도 합니다. 시력이 급격히 변하거나 시야가 누레질 수 있습니다. 복시나 다중시도 주된 증상 중 하나입니다.  
            보통 양쪽 눈에 백내장이 같이 발병하지만, 항상 그런 것은 아닙니다. 한쪽 눈에만 백내장이 생긴 경우 양 눈의 시력 차가 커질 수 있습니다.
            """
            r2 = st.button(r2_txt, key='r2', use_container_width=True)
        with c3:
            r3_txt = "백내장의 원인"
            r3_answer = """
            수정체는 안구 앞쪽에 놓인 렌즈로, 밖에서 오는 빛을 초점으로 모아서 선명한 상을 형성하도록 도와줍니다.  
            나이가 들어감에 따라 수정체에 존재하는 단백질들이 변성되고 변성된 단백질들끼리 뭉쳐 덩어리를 형성합니다.  
            이렇게 수정체에 생긴 덩어리들이 빛이 눈으로 들어오는 것을 방해해 시야를 흐리게 합니다.  
            그 과정에서 수정체 자체의 색도 누런색 등으로 변할 수 있고, 이렇게 수정체의 색이 바뀌면 눈으로 보는 세상의 색도 그에 따라 변합니다.  
            수정체의 색이 변하는 원인에는 나이뿐만 아니라 유전적 이상, 산모의 임신 중 영양 상태, 눈 주위 감염, 외상 등이 있습니다.
            """
            r3 = st.button(r3_txt, key='r3', use_container_width=True)
        
        c4, c5, c6 = st.columns([1, 1, 1])
        with c4:
            r4_txt = "백내장의 진단 및 검사"
            r4_answer = """
            백내장은 안과 의사가 직접 환자의 눈을 관찰해 진단이 이루어집니다.  
            동공이 커지도록 하는 산동제를 이용하고, 세극등현미경으로 관찰해 진단합니다.  
            진단 이후 각막내피세포검사를 통해 수술 여부를 결정하고, 수술이 필요한 경우 새로 삽입할 인공수정체를 고르기 위해 각막의 굴절률이나 안구의 크기 등을 측정합니다.  
            동시에 안압검사 등을 비롯한 기본적 안과 검진을 통해 백내장 이외에 다른 문제가 있는지 확인합니다.
            """
            r4 = st.button(r4_txt, key='r4', use_container_width=True)
        with c5:
            r5_txt = "백내장의 치료"
            r5_answer = """
            백내장의 근본적인 치료법은 수술입니다.  
            시력이 많이 나쁘지 않은 상태에서는 동공확장제를 안약으로 이용하거나 안경을 착용해 시력을 유지하고 백내장의 진행을 늦출 수 있습니다.  
            일상생활에 지장을 줄 정도로 시력이 나빠지면 수술이 필요합니다.  
            흐려진 수정체를 안구에서 제거하고 인공수정체를 삽입하는 방식으로 진행됩니다.  
            수술은 대부분 부분마취 상태에서 진행하며, 통증이 심하지 않고 시간도 오래 걸리지 않아 대부분 수술 환자는 당일 퇴원합니다.
            """
            r5 = st.button(r5_txt, key='r5', use_container_width=True)
        with c6:
            r6_txt = "주의사항"
            r6_answer = """
            백내장 수술 후에는 안구 감염이 발생할 수 있어 주의해야 합니다.  
            눈을 최대한 만지거나 비비지 않고 처방받은 안약을 꾸준히 사용해야 합니다.  
            눈에 무리가 가고 강하게 힘을 줘야 하는 운동이나 음주, 흡연은 피해야 합니다.  
            수술 후 다시 시야에 문제가 생기거나 눈동자의 색이 변하는 경우에는 신속히 검사를 받아야 합니다.  
            백내장의 예방을 위해서 음주와 흡연을 삼가고, 자외선 역시 백내장을 유발할 수 있기 때문에 햇빛이 강한 날에는 선글라스와 모자를 착용해 눈을 보호하는 것이 좋습니다.
            """
            r6 = st.button(r6_txt, key='r6', use_container_width=True)

    if "openai_model" not in st.session_state:
        st.session_state["openai_model"] = "gpt-4o-mini"

    if "messages" not in st.session_state or st.session_state["messages"] == None:
        initial_messages = [
        {"role": "system", 
         "content": 
         """당신은 백내장 수술 경험이 많은 안과 전문의 입니다.
         지금부터 당신은 백내장 수술에 관한 환자의 질문에 대답합니다.
         이 때, 반드시 아래의 지시사항에 따라서 답변을 생성합니다.
         #지시사항(instructions)
         1. 답변은 반드시 의학적 사실에 기반을 두어야하고, 근거가 없는 사실을 만들어내서는 안됩니다.
         2. 답변은 정확하고 핵심이 분명하면서도, 환자들이 불안하지 않도록 친절하게 답변합니다.
         3. 우선, 당신만의 답변을 만들 후에, 일반인이 이해할 수 있는 수준으로 대답을 정리합니다. 이 때, 어려운 용어는 설명을 짧게 덧붙입니다.
         4. 백내장 수술이나 안과와 관련이 없는 질문에는 대답할 수 없다고 말합니다.
        """}]
        initial_messages.append({
            "role": "assistant",
            "content": "안녕하세요. 백내장의 모든것 OcuGUIDE 입니다."
        })
        st.session_state.messages = initial_messages
    
    for message in st.session_state.messages[1:]:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    # st.markdown("""
    # <style>
    # .fixed-container {
    #     position: fixed;
    #     bottom: -100px;  /* chat_input 바로 위에 고정될 위치 설정 */
    #     left: 0;
    #     width: 100%;
    #     background-color: white;
    #     padding: 10px;
    #     z-index: 9999;
    #     text-align: center;
    # }   
    # </style>
    # """, unsafe_allow_html=True)
    
    # st.markdown('<div class="fixed-container">', unsafe_allow_html=True)
    # with st.container(border=True):
    #     explain, speak, listen = st.columns([4,1,1])
    #     with explain:
    #         st.write("음성 도움 안내입니다.")
    #         st.write("마이크를 눌러서 질문 후, 다시 눌러서 질문을 종료합니다.")
    #     with speak:
    #         audio_bytes = audio_recorder("말하기", key="before")
    #     with listen:
    #         on_before = st.toggle("듣기", key="toggle_before")
    # st.markdown('</div>', unsafe_allow_html=True)
    
    # 추천 질문
    if r1:
        st.session_state.messages.append({"role": "user", "content": r1_txt})
        with st.chat_message("user"):
            st.markdown(r1_txt)
        st.session_state.messages.append({"role": "assistant", "content": r1_answer})
        with st.chat_message("assistant"):
            st.write_stream(stream_data(r1_answer))
    if r2:
        st.session_state.messages.append({"role": "user", "content": r2_txt})
        with st.chat_message("user"):
            st.markdown(r2_txt)
        st.session_state.messages.append({"role": "assistant", "content": r2_answer})
        with st.chat_message("assistant"):
            st.write_stream(stream_data(r2_answer))
    if r3:
        st.session_state.messages.append({"role": "user", "content": r3_txt})
        with st.chat_message("user"):
            st.markdown(r3_txt)
        st.session_state.messages.append({"role": "assistant", "content": r3_answer})
        with st.chat_message("assistant"):
            st.write_stream(stream_data(r3_answer))
    if r4:
        st.session_state.messages.append({"role": "user", "content": r4_txt})
        with st.chat_message("user"):
            st.markdown(r4_txt)
        st.session_state.messages.append({"role": "assistant", "content": r4_answer})
        with st.chat_message("assistant"):
            st.write_stream(stream_data(r4_answer))
    if r5:
        st.session_state.messages.append({"role": "user", "content": r5_txt})
        with st.chat_message("user"):
            st.markdown(r5_txt)
        st.session_state.messages.append({"role": "assistant", "content": r5_answer})
        with st.chat_message("assistant"):
            st.write_stream(stream_data(r5_answer))
    if r6:
        st.session_state.messages.append({"role": "user", "content": r6_txt})
        with st.chat_message("user"):
            st.markdown(r6_txt)
        st.session_state.messages.append({"role": "assistant", "content": r6_answer})
        with st.chat_message("assistant"):
            st.write_stream(stream_data(r6_answer))

    # 음성 모드
    if audio_bytes:
        with st.spinner("Transcribing..."):
            rand_idx = random.randint(10000, 99999)
            webm_file_path = f"temp_{str(rand_idx)}.mp3"
            with open(webm_file_path, "wb") as f:
                f.write(audio_bytes)
            
            transcript = speech_to_text(webm_file_path)
            st.session_state.messages.append({"role": "user", "content": transcript})

            if transcript:
                with st.chat_message("user"):
                    st.markdown(transcript)
                os.remove(webm_file_path)

                with st.chat_message("assistant"):
                    stream = client.chat.completions.create(
                        model=st.session_state["openai_model"],
                        messages=[
                            {"role": m["role"], "content": m["content"]}
                            for m in st.session_state.messages
                        ],
                        stream=True,
                    )
                    response = st.write_stream(stream)
                    st.session_state.messages.append({"role": "assistant", "content": response})

    # 텍스트 입력
    if prompt := st.chat_input("궁금한 사항을 물어봐주세요."):
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)

        with st.chat_message("assistant"):
            stream = client.chat.completions.create(
                model=st.session_state["openai_model"],
                messages=[
                    {"role": m["role"], "content": m["content"]}
                    for m in st.session_state.messages
                ],
                stream=True,
            )
            response = st.write_stream(stream)
        st.session_state.messages.append({"role": "assistant", "content": response})
        # #     # 고정된 위치에 container
        # # st.markdown('<div class="fixed-container">', unsafe_allow_html=True)
        # # with st.container(border=True):
        # #     st.write("This is a container fixed above the chat input.")
        # #     st.write("This is a container fixed above the chat input.")
        # # st.markdown('</div>', unsafe_allow_html=True)    
        # st.markdown('<div class="fixed-container">', unsafe_allow_html=True)
        # with st.container(border=True):
        #     explain, speak, listen = st.columns([4,1,1])
        #     with explain:
        #         st.write("음성 도움 안내입니다.")
        #         st.write("마이크를 눌러서 질문 후, 다시 눌러서 질문을 종료합니다.")
        #     with speak:
        #         audio_bytes = audio_recorder("말하기", key="after")
        #     with listen:
        #         on_after = st.toggle("듣기", key="toggle_after")
        # st.markdown('</div>', unsafe_allow_html=True)

        
