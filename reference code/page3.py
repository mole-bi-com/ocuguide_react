import streamlit as st
# from helper import autoplay_audio, stop_audio, stream_partial_data
from page2 import supabase
import time
import base64
from streamlit_calendar import calendar
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

def autoplay_audio(file_path: str):
    with open(file_path, "rb") as f:
        data = f.read()
    b64 = base64.b64encode(data).decode("utf-8")
    md = f"""
    <audio id="audio-player" autoplay>
    <source src="data:audio/mp3;base64,{b64}" type="audio/mp3">
    </audio>
    """
    st.markdown(md, unsafe_allow_html=True)

# 오디오 정지 기능
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

def stream_partial_data(script):
    full_text = ""
    for item in script:
        for char in item['text']:
            full_text += f'<span>{char}</span>'
            yield full_text
            time.sleep(0.1)

def set_form_step(action,step=None):
    if action == 'Next':
        st.session_state['current_step'] = st.session_state['current_step'] + 1
    if action == 'Back':
        st.session_state['current_step'] = st.session_state['current_step'] - 1
    if action == 'Jump':
        st.session_state['current_step'] = step

def page_info():
    # 페이지 제목
    st.markdown(
    """
        ## 백내장 수술 정보
    """
    )

    if 'current_step' not in st.session_state:
        st.session_state['current_step'] = 0
    if 'progress' not in st.session_state:
        st.session_state['progress'] = 0
    if 'stay' not in st.session_state:
        st.session_state['stay'] = dict()

    step0_type = 'primary' if st.session_state['current_step'] == 0 else 'secondary'
    step1_type = 'primary' if st.session_state['current_step'] == 1 else 'secondary'
    step2_type = 'primary' if st.session_state['current_step'] == 2 else 'secondary'
    step3_type = 'primary' if st.session_state['current_step'] == 3 else 'secondary'
    step4_type = 'primary' if st.session_state['current_step'] == 4 else 'secondary'
    step5_type = 'primary' if st.session_state['current_step'] == 5 else 'secondary'
    step6_type = 'primary' if st.session_state['current_step'] == 6 else 'secondary'


    step_cols= st.columns([1, 1, 1, 1, 1, 1, 2])
    step_cols_below_1 = st.columns([1.1, 0.8, 1.2])
    step_cols_below_2 = st.columns([1.2, 0.9, 0.9])
    
    step_cols[0].button('개요', on_click=set_form_step, args=['Jump', 0], type=step0_type, use_container_width=True)
    able_step_1 = True if st.session_state['progress'] < 1 else False
    step_cols_below_1[0].button('**1.백내장의 정의, 수술 과정**', on_click=set_form_step, args=['Jump', 1], type=step1_type, disabled=able_step_1, use_container_width=True)

    able_step_2 = True if st.session_state['progress'] < 2 else False
    step_cols_below_1[1].button('**2.인공수정체 결정**', on_click=set_form_step, args=['Jump', 2], type=step2_type, disabled=able_step_2, use_container_width=True)
    
    able_step_3 = True if st.session_state['progress'] < 3 else False
    step_cols_below_1[2].button('**3.백내장 수술 후 시력, 일상생활**', on_click=set_form_step, args=['Jump', 3], type=step3_type, disabled=able_step_3, use_container_width=True)
    
    able_step_4 = True if st.session_state['progress'] < 4 else False
    step_cols_below_2[0].button('**4.백내장 수술의 합병증과 부작용**', on_click=set_form_step, args=['Jump', 4], type=step4_type, disabled=able_step_4, use_container_width=True)
    
    able_step_5 = True if st.session_state['progress'] < 5 else False
    step_cols_below_2[1].button('**5.빈번한 질문 리스트**', on_click=set_form_step, args=['Jump', 5], type=step5_type, disabled=able_step_5, use_container_width=True)
    
    able_step_6 = True if st.session_state['progress'] < 6 else False      
    step_cols_below_2[2].button('**6.수술 후 주의사항**', on_click=set_form_step, args=['Jump', 6], type=step6_type, disabled=able_step_6, use_container_width=True)
    
    st.markdown('---')
    personalized = False
    if 'patient_info' in st.session_state:
        if st.session_state['patient_info'] != None:
            personalized = True
    
    # 단계 0) 정보 안내
    if st.session_state['current_step'] == 0:
        with st.container():
            st.subheader("정보 개요")
            st.markdown(
            """
            **백내장 수술정보**에서는 백내장 수술에 관하여 환자분들께서 가장 궁금해하고, 꼭 알아야 할 정보를 :blue[**단계별로**] 제공합니다.
            수술 과정부터 회복, 주의사항까지 핵심적인 내용을 담아 환자분들께서 수술 전 안심하고 준비할 수 있도록 돕겠습니다. 

            - 앞으로의 동의 과정을 위해서, 관련 정보를 단계별로 확인해주세요.
            - 하나의 정보를 확인 후, :red[**다음 단계로**]버튼을 누르시면 다음 단계를 확인할 수 있습니다.

            환자분들께서 확인하실 수 있는 단계별 정보는 다음과 같습니다.
            - 정보 1) **백내장의 정의, 수술 과정**
            - 정보 2) **인공수정체 결정**
            - 정보 3) **백내장 수술 후 시력, 일상생활**
            - 정보 4) **백내장 수술의 합병증과 부작용**
            - 정보 5) **빈번한 질문 리스트**
            - 정보 6) **수술 후 주의사항**

            백내장 수술은 환자 분들의 눈 건강을 위한 안전하고 효율적인 치료법입니다. 
            세브란스 안과병원의 모든 의료진은 이를 위해 최선의 노력을 다하고 있습니다.
            이 페이지를 통해 백내장에 관한 궁금증을 해결하시고, 안심하고 수술을 준비하십시오.

            - 추가적인 질문이 있으신 경우에는 :red[ :question: Q&A 챗봇]을 통하여 간단하게 알아보세요.
            - 언제든 주치의 선생님을 통하여, 더 상세하고 친절한 설명을 받으실 수 있습니다.
            """)
            disable_step_0_again = True if st.session_state['progress'] > 0 else False
            unlock_step_1 = st.button("확인하였습니다.", type='primary', key="to_step_1", disabled=disable_step_0_again)
            if unlock_step_1:
                if 'patient_info' not in st.session_state:
                    st.warning("환자 정보를 먼저 등록해주세요.")
                elif st.session_state['patient_info'] == None:
                    st.warning("환자 정보를 먼저 등록해주세요.")
                else:
                    st.session_state['current_step'] = 1
                    st.session_state['progress'] += 1
                    st.rerun()

    # 단계 1) 백내장 및 백내장 수술
    elif st.session_state['current_step'] == 1:
        if "step1" not in st.session_state['stay']:
            st.session_state['stay']['step1'] = dict()
            st.session_state['stay']['step1']['start'] = time.time()
            # st.session_state['stay']['step1']['duration'] = 0
        
        if "step1" not in st.session_state["listen"].keys():
            st.session_state["listen"]["step1"] = False

        if st.session_state["speech_mode"] == True and st.session_state["listen"]["step1"] == False:
            st.session_state["listen"]["step1"] = True
            up, _ = st.columns([1,3])
            with up:
                stop_audio_btn1 = st.button("음성 모드 중지", key="up1", use_container_width=True)
            
            audio_files = ['./ref/contents/q1_1.mp3', './ref/contents/q1_2.mp3', './ref/contents/q1_3.mp3', './ref/contents/q1_4.mp3']
            script1 = [
                {"text": "#### Q. 백내장이란 무엇인가요?  \n\n", "time": 0},
                {"text": "- 백내장이란 카메라의 렌즈에 해당하는 수정체에 혼탁이 생기는 것입니다.\n", "time": 1.5},
                {"text": "- 가장 큰 원인은 노화이며, 이 외에도 감염이나 염증, 외상에 의해서도 발생할 수 있습니다.\n", "time": 8},
                {"text": "- 백내장을 치료할 수 있는 약제는 현재 없으며, 따라서 백내장은 반드시 수술적 치료를 해야하는 질환입니다.\n", "time": 16},
                {"text": "\n", "time": 25}
            ]
            script2 = [
                {"text": "#### Q. 백내장 수술은 어떻게 진행되나요?  \n\n", "time": 0},
                {"text": "백내장 수술은 다음과 같은 2가지 과정으로 이루어집니다. \n", "time": 3},
                {"text": "1) 백내장이 생긴 **혼탁해진 수정체를 제거**합니다.\n", "time": 8},
                {"text": "2) 수정체 역할을 대신할 **인공수정체를 넣습니다.**\n", "time": 13},
                {"text": "\n", "time": 17}
            ]
            script3 = [
                {"text": "#### Q. 백내장 수술시간은 어느정도 되나요?  \n\n", "time": 0},
                {"text": "- 평균적으로 **약 20~30분** 정도 소요되나, 수술의 **난도가 높거나 수술 중 합병증이 발생하면 더 길어질 수 있습니다.**\n", "time": 3},
                {"text": "\n", "time": 14}
            ]
            script4 = [
                {"text": "#### Q. 백내장 수술 시 마취는 어떠한 방식으로 하나요?  \n\n", "time": 0},
                {"text": "- 일반적으로 안약을 통한 점안 마취 및 국소마취로 진행됩니다.\n", "time": 4},
                {"text": "- **예외적으로 협조가 어려운 환자의 경우에는 전신마취로 진행**해야 할 수 있습니다.\n", "time": 9},
                {"text": "- 수술 중에는 최대한 움직이지 않아야 합니다.  \n", "time": 15},
                {"text": "눈을 가만히 있기 어렵거나, 30분 정도 누워있기어려운 경우, 또는 **폐쇄공포증**이 있는 경우에는 주치의에게 꼭 말씀해주시길 바랍니다. \n", "time": 18},
                {"text": "\n", "time": 30}
            ]
            scripts = [script1, script2, script3, script4]

            full_text_container = st.empty()
            full_text = ""
            stream_text_container = st.empty()

            for audio_file, script in zip(audio_files, scripts):
                autoplay_audio(audio_file)
                if stop_audio_btn1:
                    st.session_state["speech_mode"] = False
                    st.rerun()
                    stop_audio()
                start_time = time.time()
                for item in script:
                    while time.time() - start_time < item["time"]:
                        time.sleep(0.1)
                    
                    for data in stream_partial_data([item]):
                        if stop_audio_btn1:
                            stop_audio()
                            break
                        stream_text_container.markdown(data, unsafe_allow_html=True)
                    
                    if stop_audio_btn1:
                        stop_audio()
                        break
                    time.sleep(0.5)
                    stream_text_container.empty()
                    full_text += item["text"]
                    full_text_container.markdown(full_text, unsafe_allow_html=True)

                if stop_audio_btn1:
                    stop_audio()
                    break
            stream_text_container.empty()
            full_text_container.empty()

        with st.container():
            st.subheader("정보 1) 백내장의 정의, 수술 과정")

            # 내용 1-1
            st.markdown(
        """
        #### Q. 백내장이란 무엇인가요?

        - 백내장이란 **카메라의 렌즈**에 해당하는 **수정체**에 **혼탁이 생기는 것**입니다.
        - 가장 큰 원인은 노화이며, 이 외에도 감염이나 염증, 외상에 의해서도 발생할 수 있습니다.
        - 백내장을 치료할 수 있는 약제는 없으며, 따라서 백내장은 반드시 수술적 치료를 해야하는 질환입니다.
        """)
            col1_1_l, col1_1_c, col1_1_r = st.columns([1, 2, 1])
            with col1_1_l:
                if st.button(f"▶️ 음성으로 듣기", key='q1_1', use_container_width=True):
                    autoplay_audio('./ref/contents/q1_1.mp3')
            with col1_1_r:
                if st.button("듣기 중단", key='q1_1_stop', use_container_width=True):
                    stop_audio()

            # 내용 1-2
            st.markdown(
        """
        #### Q. 백내장 수술은 어떻게 진행되나요?

        백내장 수술은 다음과 같은 2가지 과정으로 이루어집니다. 
        1) 백내장이 생긴 **혼탁해진 수정체를 제거**합니다. (Phacoemulsification)
        2) 수정체 역할을 대신할 **인공수정체를 넣습니다.** (IOL implantation)
        """)
            col1_2_l, col1_2_c, col1_2_r = st.columns([1, 2, 1])
            with col1_2_l:
                if st.button(f"▶️ 음성으로 듣기", key='q1_2', use_container_width=True):
                    autoplay_audio('./ref/contents/q1_2.mp3')
            with col1_2_r:
                if st.button("듣기 중단", key='q1_2_stop', use_container_width=True):
                    stop_audio()

            # 내용 1-3
            st.markdown(
        """
        #### Q. 백내장 수술시간은 어느정도 되나요?

        - 평균적으로 :red[**약 20~30분**] 정도 소요되나, 수술의 **난도가 높거나 수술 중 합병증이 발생하면 더 길어질 수 있습니다.** 
        """)
            col1_3_l, col1_3_c, col1_3_r = st.columns([1, 2, 1])
            with col1_3_l:
                if st.button(f"▶️ 음성으로 듣기", key='q1_3', use_container_width=True):
                    autoplay_audio('./ref/contents/q1_3.mp3')
            with col1_3_r:
                if st.button("듣기 중단", key='q1_3_stop', use_container_width=True):
                    stop_audio()

            # 내용 1-4
            st.markdown(
        """
        #### Q. 백내장 수술 시 마취는 어떠한 방식으로 하나요?

        - 일반적으로 안약을 통한 점안 마취 및 국소마취로 진행됩니다.
        - **예외적으로 협조가 어려운 환자의 경우에는 전신마취로 진행**해야 할 수 있습니다.
        - 수술 중에는 최대한 움직이지 않아야 합니다. 눈을 가만히 있기 어렵거나, 30분 정도 누워있기 어려운 경우, **폐쇄공포증**이 있는 경우에는 주치의에게 꼭 말씀해주시길 바랍니다. 
        """)
            col1_4_l, col1_4_c, col1_4_r = st.columns([1, 2, 1])
            with col1_4_l:
                if st.button(f"▶️ 음성으로 듣기", key='q1_4', use_container_width=True):
                    autoplay_audio('./ref/contents/q1_4.mp3')
            with col1_4_r:
                if st.button("듣기 중단", key='q1_4_stop', use_container_width=True):
                    stop_audio()

            st.markdown('---')
            # 추가 영상
            with st.expander("백내장 수술영상"):
                st.markdown("### 백내장 수술 영상")
                st.markdown(
                """
                <div style="display: flex; justify-content: center;">
                    <iframe src="https://drive.google.com/file/d/1DTmGn-RaQs9R7T3k1VfbPf1TiOQ0xki0/preview" 
                            style="width: 90%; height: auto; aspect-ratio: 16/9;" 
                            frameborder="0" allowfullscreen></iframe>
                </div>
                """,
                unsafe_allow_html=True)
            
        down1, down2, down3 = st.columns([1, 1, 1.2])
        with down1 :
            disable_step_1_again = True if st.session_state['progress'] > 1 else False
            unlock_step_2 = st.button("확인하였습니다.",  type='primary', key="to_step_2", disabled=disable_step_1_again)
            if unlock_step_2:
                st.session_state['current_step'] = 2
                st.session_state['progress'] += 1
                st.session_state['stay']["step1"]['duration'] = int(time.time() - st.session_state['stay']['step1']['start'])
                st.rerun()

        with down3:
            if st.button("전체 다시 듣기", use_container_width=True):
                st.session_state["speech_mode"] = True
                st.session_state["listen"]["step1"] = False
                st.rerun()

    # 단계 2) 백내장 수술에서 렌즈의 종류 및 도수
    elif st.session_state['current_step'] == 2:
        if "step2" not in st.session_state['stay']:
            st.session_state['stay']['step2'] = dict()
            st.session_state['stay']['step2']['start'] = time.time()
            # st.session_state['stay']['step2']['duration'] = 0

        if "step2" not in st.session_state["listen"].keys():
            st.session_state["listen"]["step2"] = False
        
        if st.session_state["speech_mode"] == True and st.session_state["listen"]["step2"] == False:
            st.session_state["listen"]["step2"] = True
            up, _ = st.columns([1,3])
            with up:
                stop_audio_btn2 = st.button("음성 모드 중지", key="up2", use_container_width=True)
            
            audio_files = ['./ref/contents/q2_1.mp3']
            script1 = [
                {"text": "#### Q. 백내장 수술시 눈의 도수는 어떻게 되나요?  \n\n", "time": 0},
                {"text": "- 자연적인 수정체는 거리에 따라 자동으로 초점을 맞추어 주는 조절력이 있습니다.  \n", "time": 4},
                {"text": "백내장 수술 시 삽입되는 인공수정체는 자연적인 수정체와는 달리 이러한 조절력이 없습니다.\n", "time": 11},
                {"text": "- **따라서, 백내장 수술을 하게 되면 원거리나 근거리 중 한 곳에만 초점을 맺게 됩니다.**  \n", "time": 17},
                {"text": "**일반적으로, 원거리가 잘 보이도록 인공수정체를 삽입하게 되며,", "time": 24},
                {"text": "이 경우 근거리를 볼 때는 안경 착용이 필요합니다.**\n", "time": 29},
                {"text": "    + (근거리 작업이 많은 경우 근거리가 잘 보이도록 하는 것도 가능합니다.)\n", "time": 33},
                {"text": "- 최근에는 이러한 단점을 보완한 새로운 인공수정체들이 사용되고 있으며, 종류는 다음과 같습니다.\n", "time": 38},
                {"text": "1) **다초점 인공수정체 (Multifocal)**\n", "time": 46},
                {"text": "+ 원거리와 근거리(30cm) 모두 잘 보이도록 고안된 인공수정체로 ", "time": 49},
                {"text": "주로 노안 교정시에 많이 사용되나 빛번짐 등의 부작용이 있을 수 있습니다.\n", "time": 55},
                {"text": "+ 녹내장이나 황반변성 등 시신경이나 망막 이상이 있는 환자에는 권장되지 않습니다.\n", "time": 61},
                {"text": "2) **강화 단초점 인공수정체**\n", "time": 68},
                {"text": "+ 단초점 인공수정체보다 중간거리(50cm)가 잘 보이도록 만들어진 인공수정체입니다. \n", "time": 72},
                {"text": "+ 다초점 인공수정체보다 부작용이 적으나, 근거리에서 안경 착용이 필요할 수 있습니다.\n", "time": 80},
                {"text": "3) **난시교정렌즈 (Toric)**\n", "time": 87},
                {"text": "+ 난시가 심한 경우 난시교정렌즈를 고려할 수 있습니다.\n\n", "time": 89},
                {"text": "- **수술 후에는 인공수정체의 교체가 어렵기 때문에**, \n", "time": 94},
                {"text": " 개개인의 연령 및 눈 상태에 따라 알맞은 인공수정체를 결정하는 것이 중요합니다.  \n", "time": 98},
                {"text": "**인공수정체 결정은 주치의선생님의 설명을 충분히 들은후에 결정하시기 바랍니다.**", "time": 105},
                {"text": "\n", "time": 110}
            ]

            scripts = [script1]
            full_text_container = st.empty()
            full_text = ""
            stream_text_container = st.empty()
            for audio_file, script in zip(audio_files, scripts):
                autoplay_audio(audio_file)
                if stop_audio_btn2:
                    st.session_state["speech_mode"] = False
                    st.rerun()
                    stop_audio()
                start_time = time.time()
                for item in script:
                    while time.time() - start_time < item["time"]:
                        time.sleep(0.1)
                    
                    for data in stream_partial_data([item]):
                        if stop_audio_btn2:
                            stop_audio()
                            break
                        stream_text_container.markdown(data, unsafe_allow_html=True)
                    
                    if stop_audio_btn2:
                        stop_audio()
                        break
                    time.sleep(0.5)
                    stream_text_container.empty()
                    full_text += item["text"]
                    full_text_container.markdown(full_text, unsafe_allow_html=True)

                if stop_audio_btn2:
                    stop_audio()
                    break
            stream_text_container.empty()
            full_text_container.empty()

        with st.container():        
            st.subheader("단계 2) 인공수정체 결정")

            # 내용 2-1
            st.markdown(
        """
        #### Q. 백내장 수술시 눈의 도수는 어떻게 되나요?

        - 자연적인 수정체는 거리에 따라 자동으로 초점을 맞추어 주는 조절력이 있습니다.  
        백내장 수술 시 삽입되는 인공수정체는 자연적인 수정체와는 달리 이러한 조절력이 없습니다.
        - **따라서, 백내장 수술을 하게 되면 원거리나 근거리 중 한 곳에만 초점을 맺게 됩니다.  
        일반적으로, 원거리가 잘 보이도록 인공수정체를 삽입하게 되며, 이 경우 근거리를 볼 때는 안경 착용이 필요합니다.** 
            + (근거리 작업이 많은 경우 근거리가 잘 보이도록 하는 것도 가능합니다.)
        - 최근에는 이러한 단점을 보완한 새로운 인공수정체들이 사용되고 있으며, 종류는 다음과 같습니다.
        
        1) **다초점 인공수정체 (Multifocal)**
            + 원거리와 근거리(30cm) 모두 잘 보이도록 고안된 인공수정체로 주로 노안 교정시에 많이 사용되나 빛번짐 등의 부작용이 있을 수 있습니다.
            + 녹내장이나 황반변성 등 시신경이나 망막 이상이 있는 환자에는 권장되지 않습니다.

        2) **강화 단초점 인공수정체**
            + 단초점 인공수정체보다 중간거리(50cm)가 잘 보이도록 만들어진 인공수정체입니다. 
            + 다초점 인공수정체보다 부작용이 적으나, 근거리에서 안경 착용이 필요할 수 있습니다.

        3) **난시교정렌즈 (Toric)**
            + 난시가 심한 경우 난시교정렌즈를 고려할 수 있습니다.

        - **수술 후에는 인공수정체의 교체가 어렵기 때문에**, 개개인의 연령 및 눈 상태에 따라 알맞은 인공수정체를 결정하는 것이 중요합니다.  
        **인공수정체 결정은 주치의선생님의 설명을 충분히 들은후에 결정하시기 바랍니다.**
        """)
            col2_1_l, col2_1_c, col2_1_r = st.columns([1, 2, 1])
            with col2_1_l:
                if st.button(f"▶️ 음성으로 듣기", key='q2_1', use_container_width=True):
                    autoplay_audio('./ref/contents/q2_1.mp3')
            with col2_1_r:
                if st.button("듣기 중단", key='q2_1_stop', use_container_width=True):
                    stop_audio()

            st.markdown('---')
            down1, down2, down3 = st.columns([1, 1, 1.2])
            with down1 :
                disable_step_2_again = True if st.session_state['progress'] > 2 else False
                unlock_step_3 = st.button("확인하였습니다.", type='primary', key="to_step_3", disabled=disable_step_2_again)
                if unlock_step_3:
                    st.session_state['current_step'] = 3
                    st.session_state['progress'] += 1
                    st.session_state['stay']["step2"]['duration'] = int(time.time() - st.session_state['stay']['step2']['start'])
                    st.rerun()

            with down3:
                if st.button("전체 다시 듣기", use_container_width=True):
                    st.session_state["speech_mode"] = True
                    st.session_state["listen"]["step2"] = False
                    st.rerun()

    # 단계 3) 백내장 수술 후 시력, 일상생활
    elif st.session_state['current_step'] == 3:
        if "step3" not in st.session_state['stay']:
            st.session_state['stay']['step3'] = dict()
            st.session_state['stay']['step3']['start'] = time.time()
            # st.session_state['stay']['step3']['duration'] = 0

        if "step3" not in st.session_state["listen"].keys():
            st.session_state["listen"]["step3"] = False
        
        if st.session_state["speech_mode"] == True and st.session_state["listen"]["step3"] == False:
            st.session_state["listen"]["step3"] = True
            up, _ = st.columns([1,3])
            with up:
                stop_audio_btn3 = st.button("음성 모드 중지", key="up3", use_container_width=True)

            audio_files = ['./ref/contents/q3_1.mp3', './ref/contents/q3_2.mp3', './ref/contents/q3_3.mp3', './ref/contents/q3_4.mp3']
            script1 = [
                {"text": "#### Q. 백내장 수술 후에는 언제부터 잘 보이게 되나요?  \n\n", "time": 0},
                {"text": "- 수술 직후나 다음날부터 잘 보이는 경우도 있으나 각막 부종 등으로 오히려 일시적으로 시력이 떨어질 수도 있습니다.\n", "time": 4},
                {"text": " 일반적으로 1~2주간의 회복기를 거치며 서서히 시력이 호전됩니다.\n", "time": 13},
                {"text": "- 수술 후 1~2달 정도 뒤에 최종적으로 정확한 시력 및 도수를 알 수 있습니다.  \n", "time": 20},
                {"text": "안경이 필요할 경우 이 시기에 처방을 받으시면 됩니다.\n", "time": 26},
                {"text": "- 망막질환, 녹내장 등 기저 안질환이 동반되어 있는 경우에는 시력 회복이 제한될 수 있습니다.\n", "time": 31},
                {"text": "\n", "time": 38}
            ]
            script2 = [
                {"text": "#### Q. 백내장 수술 이후 일상생활은 언제부터 가능한가요?  \n\n", "time": 0},
                {"text": "- 백내장 수술 당일부터 가벼운 일상 생활이 가능하며 식사에도 제약이 없습니다. \n", "time": 4},
                {"text": "다만, 과도한 운동이나 심하게 고개를 숙이는 자세 등은 삼가야 합니다.\n", "time": 11},
                {"text": "- **세수와 샤워는 일주일 뒤부터 가능하며, 수영장이나 목욕탕 이용은 한달 뒤부터 가능합니다.**\n", "time": 17},
                {"text": "\n", "time": 24}
            ]
            script3 = [
                {"text": "#### Q. 백내장 수술 후에는 안약을 얼마나 사용하나요?  \n\n", "time": 0},
                {"text": "- 일반적으로 수술 후에는 항생제, 항염증제 등 **안약을 1~2달간 사용**하게 됩니다.\n", "time": 4},
                {"text": "- 회복 경과에 따라 안약을 더 오래 사용해야 하거나 추가해야 할 수 있습니다. \n", "time": 11},
                {"text": "\n", "time": 16}
            ]
            script4 = [
                {"text": "#### Q. 백내장 수술 후에는 병원에 얼마나 자주 와야하나요?  \n\n", "time": 0},
                {"text": "- 특별한 문제가 없다면 수술일 기준 **다음날, 1주일, 1개월, 3-6개월 주기로 내원**하게 됩니다.\n", "time": 4},
                {"text": "\n", "time": 13}
            ]
            scripts = [script1, script2, script3, script4]

            full_text_container = st.empty()
            full_text = ""
            stream_text_container = st.empty()

            for audio_file, script in zip(audio_files, scripts):
                autoplay_audio(audio_file)
                if stop_audio_btn3:
                    st.session_state["speech_mode"] = False
                    st.rerun()
                    stop_audio()
                start_time = time.time()
                for item in script:
                    while time.time() - start_time < item["time"]:
                        time.sleep(0.1)
                    
                    for data in stream_partial_data([item]):
                        if stop_audio_btn3:
                            stop_audio()
                            break
                        stream_text_container.markdown(data, unsafe_allow_html=True)
                    
                    if stop_audio_btn3:
                        stop_audio()
                        break
                    time.sleep(0.5)
                    stream_text_container.empty()
                    full_text += item["text"]
                    full_text_container.markdown(full_text, unsafe_allow_html=True)

                if stop_audio_btn3:
                    stop_audio()
                    break
            stream_text_container.empty()
            full_text_container.empty()
        
        with st.container():
            st.subheader("단계 3) 백내장 수술 후 시력, 일상생활")
            
            # 내용 3-1 : *****환자별 정보 입력 후에는 수정할 수 있도록 함
            diag = st.session_state['patient_info']['diagnosis']
            patient_name = st.session_state['patient_info']['patient_name']

            st.markdown(
        """
        #### Q. 백내장 수술 후에는 언제부터 잘 보이게 되나요?

        - 수술 직후나 다음날부터 잘 보이는 경우도 있으나 각막 부종 등으로 오히려 일시적으로 시력이 떨어질 수도 있습니다.  
        일반적으로 1~2주간의 회복기를 거치며 서서히 시력이 호전됩니다.
        - 수술 후 1~2달 정도 뒤에 최종적으로 정확한 시력 및 도수를 알 수 있습니다.  
        안경이 필요할 경우 이 시기에 처방을 받으시면 됩니다.
        - 망막질환, 녹내장 등 기저 안질환이 동반되어 있는 경우에는 시력 회복이 제한될 수 있습니다.
        """)
            col3_1_l, col3_1_c, col3_1_r = st.columns([1, 2, 1])
            with col3_1_l:
                if st.button(f"▶️ 음성으로 듣기", key='q3_1', use_container_width=True):
                    autoplay_audio('./ref/contents/q3_1.mp3')
            with col3_1_r:
                if st.button("듣기 중단", key='q3_1_stop', use_container_width=True):
                    stop_audio()
                    
            # 내용 3-2
            st.markdown(
        """
        #### Q. 백내장 수술 이후 일상생활은 언제부터 가능한가요?

        - 백내장 수술 당일부터 가벼운 일상 생활이 가능하며 식사에도 제약이 없습니다.  
        다만, 과도한 운동이나 심하게 고개를 숙이는 자세 등은 삼가야 합니다.
        - **세수와 샤워는 일주일 뒤부터 가능하며, 수영장이나 목욕탕 이용은 한달 뒤부터 가능합니다.**
        """)
            col3_2_l, col3_2_c, col3_2_r = st.columns([1, 2, 1])
            with col3_2_l:
                if st.button(f"▶️ 음성으로 듣기", key='q3_2', use_container_width=True):
                    autoplay_audio('./ref/contents/q3_2.mp3')
            with col3_2_r:
                if st.button("듣기 중단", key='q3_2_stop', use_container_width=True):
                    stop_audio()
            
            # 내용 3-3
            st.markdown(
        """
        #### Q. 백내장 수술 후에는 안약을 얼마나 사용하나요?

        - 일반적으로 수술 후에는 항생제, 항염증제 등 **안약을 1~2달간 사용**하게 됩니다.
        - 회복 경과에 따라 안약을 더 오래 사용해야 하거나 추가해야 할 수 있습니다. 
        """)
            col3_3_l, col3_3_c, col3_3_r = st.columns([1, 2, 1])
            with col3_3_l:
                if st.button(f"▶️ 음성으로 듣기", key='q3_3', use_container_width=True):
                    autoplay_audio('./ref/contents/q3_3.mp3')
            with col3_3_r:
                if st.button("듣기 중단", key='q3_3_stop', use_container_width=True):
                    stop_audio()
                    
            # 내용 3-4
            st.markdown(
        """
        #### Q. 백내장 수술 후에는 병원에 얼마나 자주 와야하나요?

        - 특별한 문제가 없다면 수술일 기준 **다음날, 1주일, 1개월, 3-6개월 주기로 내원**하게 됩니다.
        """)
            col3_4_l, col3_4_c, col3_4_r = st.columns([1, 2, 1])
            with col3_4_l:
                if st.button(f"▶️ 음성으로 듣기", key='q3_4', use_container_width=True):
                    autoplay_audio('./ref/contents/q3_4.mp3')
            with col3_4_r:
                if st.button("듣기 중단", key='q3_4_stop', use_container_width=True):
                    stop_audio()
            
            st.markdown('---')
            down1, down2, down3 = st.columns([1, 1, 1.2])
            with down1 :
                disable_step_3_again = True if st.session_state['progress'] > 3 else False
                unlock_step_4 = st.button("확인하였습니다.", type='primary', key="to_step_4", disabled=disable_step_3_again)
                if unlock_step_4:
                    st.session_state['current_step'] = 4
                    st.session_state['progress'] += 1
                    st.session_state['stay']["step3"]['duration'] = int(time.time() - st.session_state['stay']['step3']['start'])
                    st.rerun()

            with down3:
                if st.button("전체 다시 듣기", use_container_width=True):
                    st.session_state["speech_mode"] = True
                    st.session_state["listen"]["step3"] = False
                    st.rerun()

    # 단계 4) 백내장 수술의 부작용 및 합병증
    elif st.session_state['current_step'] == 4:
        if "step4" not in st.session_state['stay']:
            st.session_state['stay']['step4'] = dict()
            st.session_state['stay']['step4']['start'] = time.time()
            # st.session_state['stay']['step4']['duration'] = 0

        if "step4" not in st.session_state["listen"].keys():
            st.session_state["listen"]["step4"] = False
        
        if st.session_state["speech_mode"] == True and st.session_state["listen"]["step4"] == False:
            st.session_state["listen"]["step4"] = True
            up, _ = st.columns([1,3])
            with up:
                stop_audio_btn4 = st.button("음성 모드 중지", key="up4", use_container_width=True)
            
            audio_files = ['./ref/contents/q4_1.mp3']
            script1 = [
                {"text": "#### Q. 백내장 수술의 부작용에는 어떤 것들이 있나요?  \n\n", "time": 0},
                {"text": "- 백내장 수술의 부작용은 크게 '수술 중 합병증'과 '수술 후 부작용/합병증' 으로 나눌 수 있습니다.\n", "time": 5},
                {"text": "1) 수술 중 합병증\n", "time": 13},
                {"text": "- 백내장 수술 도중 발생할 수 있는 합병증은 여러가지가 있으나 ", "time": 16},
                {"text": "가장 중요한 합병증은 **후낭파열** 과 **유리체 탈출**입니다.\n", "time": 18},
                {"text": "- 백내장 수술과정의 약 5%에서 나타날 수 있는 합병증이며,", "time": 24},
                {"text": " 특히 난도가 높은 백내장 수술에서 발생 확률이 증가합니다.\n", "time": 28},
                {"text": "- 이러한 경우에는 유리체절제술이라는 추가 수술이 필요할 수 있으며,", "time": 35},
                {"text": " 삽입되는 인공수정체의 종류나 위치가 달라질 수 있습니다.\n", "time": 39},
                {"text": "2) 수술 후 경미한 부작용\n", "time": 44},
                {"text": "- 경미한 수술 부작용으로는 **건조증, 이물감, 눈주변 불편감, 결막하출혈** 등이 있습니다.\n", "time": 48},
                {"text": "- 건조증은 수술 후 일시적으로 악화될 수 있으나 대부분 시간이 지나면서 호전됩니다.  \n", "time": 56},
                {"text": " 하지만 수술 전 건조증이 심했던 경우, 증상이 심해지거나 오랜 기간 지속될 수 있습니다.\n", "time": 63},
                {"text": "- 결막하출혈은 자연스럽게 나타나며 2-4주 안에 자연소멸됩니다.\n", "time": 70},
                {"text": "- **비문증(날파리증)** 또한 흔한 부작용 중 하나이며, 수술 이후 이로 인한 불편감이 나타날 수 있습니다.\n", "time": 75},
                {"text": "3) 수술 후 심한 합병증\n", "time": 83},
                {"text": "- 가장 심각한 부작용으로는 **수술 후 감염**이 있으며 1/1000 확률로 발생한다고 알려져 있습니다.\n", "time": 87},
                {"text": "- 이를 예방하기 위하여 뒤에서 설명될 수술 후 주의사항을 반드시 숙지하시기 바랍니다. \n", "time": 94},
                {"text": "- 수술 후 갑작스런 시력저하, 통증, 심한충혈 발생시, 감염의 초기 증상일 수 있으므로 즉시 내원하셔야 합니다.\n", "time": 101},
                {"text": "- 수술 후 감염 발생시에는 반복적인 안구내주사 혹은 재수술 (유리체절제술)이 필요할 수 있습니다.\n", "time": 111},
                {"text": "- 이외에도 백내장 수술 이후 안검하수, 복시, 망막박리 등의 합병증이 발생할 수 있습니다.\n", "time": 119},
                {"text": "4) 수술 후 장기적인 합병증\n", "time": 127},
                {"text": "- (1) **인공수정체의 탈구/아탈구**\n", "time": 130},
                {"text": "+ 인공수정체가 기존의 위치에서 이탈되는 것을 뜻하며, 백내장 수술 이후 발생할 수 있는 장기적인 합병증 중 하나입니다.\n", "time": 134},
                {"text": "+ 인공수정체를 지지해주는 역할을 하는 소대라는 구조가 약한 경우 발생할 가능성이 높습니다.\n", "time": 143},
                {"text": "+ 인공수정체가 탈구/아탈구된 경우에는 재수술 (유리체절제술 및 이차적 인공수정체 삽입술)이 필요하게 됩니다.\n", "time": 151},
                {"text": "- (2) **각막부종**\n", "time": 160},
                {"text": "+ 수술 직후에도 일시적으로 발생할 수 있으나, 수술 전 각막내피세포가 좋지 않은 경우 각막부종이 오래 지속될 수 있습니다.\n", "time": 163},
                {"text": "+ 각막부종이 장기간 지속되면 시력회복이 더딜 수 있으며, 호전되지 않는 경우에는 각막이식술이 필요할 수 있습니다.\n", "time": 172},
                {"text": "- (3) **후낭혼탁**\n", "time": 180},
                {"text": "+ 인공수정체가 들어있는 주머니 구조에 혼탁이 생기는 것으로, 후발백내장이라고도 합니다.\n", "time": 183},
                {"text": "+ 이는 수술 이후에 자연스럽게 생길 수 있는 합병증으로 재수술이 아닌 간단한 ‘YAG 레이져 시술’을 통해 제거할 수 있습니다.\n", "time": 190},
                {"text": "\n", "time": 197}
            ]

            scripts = [script1]
            full_text_container = st.empty()
            full_text = ""
            stream_text_container = st.empty()
            for audio_file, script in zip(audio_files, scripts):
                autoplay_audio(audio_file)
                if stop_audio_btn4:
                    st.session_state["speech_mode"] = False
                    st.rerun()
                    stop_audio()
                start_time = time.time()
                for item in script:
                    while time.time() - start_time < item["time"]:
                        time.sleep(0.1)
                    
                    for data in stream_partial_data([item]):
                        if stop_audio_btn4:
                            stop_audio()
                            break
                        stream_text_container.markdown(data, unsafe_allow_html=True)
                    
                    if stop_audio_btn4:
                        stop_audio()
                        break
                    time.sleep(0.5)
                    stream_text_container.empty()
                    full_text += item["text"]
                    full_text_container.markdown(full_text, unsafe_allow_html=True)

                if stop_audio_btn4:
                    stop_audio()
                    break
            stream_text_container.empty()
            full_text_container.empty()

        
        with st.container():
            st.subheader("단계 4) 백내장 수술의 합병증과 부작용")

            # 내용 4-1 : *****환자별 정보 입력 후에는 수정할 수 있도록 함
            st.markdown(
        """
        #### Q. 백내장 수술의 부작용에는 어떤 것들이 있나요?

        - 백내장 수술의 부작용은 크게 '수술 중 합병증'과 '수술 후 부작용/합병증' 으로 나눌 수 있습니다.

        1) 수술 중 합병증
            - 백내장 수술 도중 발생할 수 있는 합병증은 여러가지가 있으나 가장 중요한 합병증은 **후낭파열 (Posterior capsular rupture)** 과 **유리체 탈출**(Vitreous prolapse)입니다. 
            - 백내장 수술과정의 약 5%에서 나타날 수 있는 합병증이며, 특히 난도가 높은 백내장 수술에서 발생 확률이 증가합니다.
            - 이러한 경우에는 유리체절제술이라는 추가 수술이 필요할 수 있으며, 삽입되는 인공수정체의 종류나 위치가 달라질 수 있습니다.

        2) 수술 후 경미한 부작용
            - 경미한 수술 부작용으로는 ':red[**건조증**], **이물감, 눈주변 불편감, 결막하출혈'** 등이 있습니다.
            - 건조증은 수술 후 일시적으로 악화될 수 있으나 대부분 시간이 지나면서 호전됩니다. 하지만 수술 전 건조증이 심했던 경우, 증상이 심해지거나 오랜 기간 지속될 수 있습니다.
            - 결막하출혈은 자연스럽게 나타나며 2-4주 안에 자연소멸됩니다.
            - :red[**비문증(날파리증)**] 또한 흔한 부작용 중 하나이며, 수술 이후 이로 인한 불편감이 나타날 수 있습니다.

        3) 수술 후 심한 합병증
            - 가장 심각한 부작용으로는 :red[**수술 후 감염**]이 있으며 1/1000 확률로 발생한다고 알려져 있습니다.
            - 이를 예방하기 위하여 뒤에서 설명될 수술 후 주의사항을 반드시 숙지하시기 바랍니다.
            - 수술 후 갑작스런 시력저하, 통증, 심한충혈 발생시, 감염의 초기 증상일 수 있으므로 즉시 내원하셔야 합니다. 
            - 수술 후 감염 발생시에는 반복적인 안구내주사 혹은 재수술 (유리체절제술)이 필요할 수 있습니다.   
            - 이외에도 백내장 수술 이후 안검하수, 복시, 망막박리 등의 합병증이 발생할 수 있습니다.

        4) 수술 후 장기적인 합병증
            - (1) **인공수정체의 탈구/아탈구**
                + 인공수정체가 기존의 위치에서 이탈되는 것을 뜻하며, 백내장 수술 이후 발생할 수 있는 장기적인 합병증 중 하나입니다.
                + 인공수정체를 지지해주는 역할을 하는 소대라는 구조가 약한 경우 발생할 가능성이 높습니다.
                + 인공수정체가 탈구/아탈구된 경우에는 재수술 (유리체절제술 및 이차적 인공수정체 삽입술)이 필요하게 됩니다.

            - (2) **각막부종**
                + 수술 직후에도 일시적으로 발생할 수 있으나, 수술 전 각막내피세포가 좋지 않은 경우 각막부종이 오래 지속될 수 있습니다.
                + 각막부종이 장기간 지속되면 시력회복이 더딜 수 있으며, 호전되지 않는 경우에는 각막이식술이 필요할 수 있습니다.  

            - (3) **후낭혼탁**
                + 인공수정체가 들어있는 주머니 구조에 혼탁이 생기는 것으로, 후발백내장이라고도 합니다
                + 이는 수술 이후에 자연스럽게 생길 수 있는 합병증으로 재수술이 아닌 간단한 ‘YAG 레이져 시술’을 통해 제거할 수 있습니다.

        """)
            col4_1_l, col4_1_c, col4_1_r = st.columns([1, 2, 1])
            with col4_1_l:
                if st.button(f"▶️ 음성으로 듣기", key='q4_1', use_container_width=True):
                    autoplay_audio('./ref/contents/q4_1.mp3')
            with col4_1_r:
                if st.button("듣기 중단", key='q4_1_stop', use_container_width=True):
                    stop_audio()
            
            st.markdown('---')
            down1, down2, down3 = st.columns([1, 1, 1.2])
            with down1 :
                disable_step_4_again = True if st.session_state['progress'] > 4 else False
                unlock_step_5 = st.button("확인하였습니다.", type='primary', key="to_step_5", disabled=disable_step_4_again)
                if unlock_step_5:
                    st.session_state['current_step'] = 5
                    st.session_state['progress'] += 1
                    st.session_state['stay']["step4"]['duration'] = int(time.time() - st.session_state['stay']['step4']['start'])
                    st.rerun()

            with down3:
                if st.button("전체 다시 듣기", use_container_width=True):
                    st.session_state["speech_mode"] = True
                    st.session_state["listen"]["step4"] = False
                    st.rerun()

    # 단계 5) 자주 묻는 질문
    elif st.session_state['current_step'] == 5:
        if "step5" not in st.session_state['stay']:
            st.session_state['stay']['step5'] = dict()
            st.session_state['stay']['step5']['start'] = time.time()
            # st.session_state['stay']['step5']['duration'] = 0

        if "step5" not in st.session_state["listen"].keys():
            st.session_state["listen"]["step5"] = False
        
        if st.session_state["speech_mode"] == True and st.session_state["listen"]["step5"] == False:
            st.session_state["listen"]["step5"] = True
            up, _ = st.columns([1,3])
            with up:
                stop_audio_btn5 = st.button("음성 모드 중지", key="up5", use_container_width=True)

            audio_files = ['./ref/contents/q5_1.mp3', './ref/contents/q5_2.mp3', './ref/contents/q5_3.mp3', './ref/contents/q5_4.mp3']
            script1 = [
                {"text": "#### Q. 양쪽 눈을 동시에 수술이 가능한가요?  \n\n", "time": 0},
                {"text": "- 양쪽 눈이 모두 백내장 수술이 필요한 경우, 수술 중이나 후에 발생할 수 있는 합병증의 영향을 최소화하고,", "time": 4},
                {"text": " 일상생활을 최대한 유지할 수 있도록 한쪽 눈씩 수술을 진행하게 됩니다.\n", "time": 10},
                {"text": "- 그러나 전신마취가 필요한 경우, 건강 상태가 좋지 않아 여러 번의 수술이 어려운 경우 등에는 양쪽 눈을 동시에 수술하기도 합니다.\n", "time": 17},
                {"text": "\n", "time": 26}
            ]
            script2 = [
                {"text": "#### Q. 백내장 수술 시 며칠동안 입원해야 하나요?  \n\n", "time": 0},
                {"text": "- 백내장 수술은 당일 수술 후 당일 귀가하는 일일입원으로 진행됩니다. \n", "time": 4},
                {"text": "- 수술 중 합병증이 발생하거나 전신마취로 수술이 진행되는 경우에는 필요에 따라 추가적인 입원 치료가 필요할 수 있습니다.\n", "time": 10},
                {"text": "\n", "time": 18}
            ]
            script3 = [
                {"text": "#### Q. 수술 당일에는 언제 와야 하고, 어떻게 준비해야 하나요?  \n\n", "time": 0},
                {"text": "- 수술 당일 내원시간은 수술 전날 전화 및 문자메세지로 안내해드립니다.  \n", "time": 5},
                {"text": " 수술 전날 전화를 놓치지 않도록 유의하여 주시기 바랍니다. \n", "time": 11},
                {"text": "- 수술 당일에도 식사는 가능합니다.  \n", "time": 16},
                {"text": " 수술에 무리가 되지 않도록 소화가 잘 되는 음식으로 가볍게 식사하시기 바랍니다. \n", "time": 19},
                {"text": "- 일반적으로 **수술 1-2시간 전에 도착**하여 산동제를 점안하기 시작하며, ", "time": 25},
                {"text": " 충분히 산동 된 것을 확인한 후 수술을 진행하게 됩니다. \n", "time": 30},
                {"text": "- 수술 후에는 충분히 휴식 후, 담당 간호사에게 주의사항 및 퇴원약 안내를 받고 퇴원하게 됩니다.\n", "time": 36},
                {"text": "\n", "time": 44}
            ]
            script4 = [
                {"text": "#### Q. 백내장 수술 전에 복용하지 말아야 할 약제가 있을까요?  \n\n", "time": 0},
                {"text": "- 혈압약, 당뇨약, 항응고제 등 대부분의 약제는 수술 당일에도 복용 가능합니다.\n", "time": 4},
                {"text": "- 다만, 일부 환자의 경우에는 백내장 수술에 영향을 미치는 약제가 있을 수 있으므로, ", "time": 11},
                {"text": " 수술 전 주치의나 수술 코디네이터에게 꼭 알려주시기 바랍니다.\n", "time": 17},
                {"text": "\n", "time": 22}
            ]
            scripts = [script1, script2, script3, script4]

            full_text_container = st.empty()
            full_text = ""
            stream_text_container = st.empty()
            for audio_file, script in zip(audio_files, scripts):
                autoplay_audio(audio_file)
                if stop_audio_btn5:
                    st.session_state["speech_mode"] = False
                    st.rerun()
                    stop_audio()
                start_time = time.time()
                for item in script:
                    while time.time() - start_time < item["time"]:
                        time.sleep(0.1)
                    
                    for data in stream_partial_data([item]):
                        if stop_audio_btn5:
                            stop_audio()
                            break
                        stream_text_container.markdown(data, unsafe_allow_html=True)
                    
                    if stop_audio_btn5:
                        stop_audio()
                        break
                    time.sleep(0.5)
                    stream_text_container.empty()
                    full_text += item["text"]
                    full_text_container.markdown(full_text, unsafe_allow_html=True)

                if stop_audio_btn5:
                    stop_audio()
                    break
            stream_text_container.empty()
            full_text_container.empty()

        with st.container():
            st.subheader("단계 5) 빈번한 질문 리스트")

            # 내용 5-1
            st.markdown(
        """
        #### Q. 양쪽 눈을 동시에 수술이 가능한가요?

        - 양쪽 눈이 모두 백내장 수술이 필요한 경우, 수술 중이나 후에 발생할 수 있는 합병증의 영향을최소화하고, 일상생활을 최대한 유지할 수 있도록 한쪽 눈씩 수술을 진행하게 됩니다.
        - 그러나 전신마취가 필요한 경우, 건강 상태가 좋지 않아 여러 번의 수술이 어려운 경우 등에는 양쪽 눈을 동시에 수술하기도 합니다

        """)
            col5_1_l, col5_1_c, col5_1_r = st.columns([1, 2, 1])
            with col5_1_l:
                if st.button(f"▶️ 음성으로 듣기", key='q5_1', use_container_width=True):
                    autoplay_audio('./ref/contents/q5_1.mp3')
            with col5_1_r:
                if st.button("듣기 중단", key='q5_1_stop', use_container_width=True):
                    stop_audio()
            
            # 내용 5-2
            st.markdown(
        """
        #### Q. 백내장 수술 시 며칠동안 입원해야 하나요?

        - 백내장 수술은 당일 수술 후 당일 귀가하는 일일입원으로 진행됩니다. 
        - 수술 중 합병증이 발생하거나 전신마취로 수술이 진행되는 경우에는 필요에 따라 추가적인 입원 치료가 필요할 수 있습니다.

        """)
            col5_2_l, col5_2_c, col5_2_r = st.columns([1, 2, 1])
            with col5_2_l:
                if st.button(f"▶️ 음성으로 듣기", key='q5_2', use_container_width=True):
                    autoplay_audio('./ref/contents/q5_2.mp3')
            with col5_2_r:
                if st.button("듣기 중단", key='q5_2_stop', use_container_width=True):
                    stop_audio()

            # 내용 5-3
            st.markdown(
        """
        #### Q. 수술 당일에는 언제 와야 하고, 어떻게 준비해야 하나요? 

        - 수술 당일 내원시간은 수술 전날 전화 및 문자메세지로 안내해드립니다. 수술 전날 전화를 놓치지 않도록 유의하여 주시기 바랍니다.
        - 수술 당일에도 식사는 가능합니다. 수술에 무리가 되지 않도록 소화가 잘 되는 음식으로 가볍게 식사하시기 바랍니다.
        - 일반적으로 **수술 1-2시간 전에 도착**하여 산동제를 점안하기 시작하며, 충분히 산동 된 것을 확인한 후 수술을 진행하게 됩니다.
        - 수술 후에는 충분히 휴식 후, 담당 간호사에게 주의사항 및 퇴원약 안내를 받고 퇴원하게 됩니다.
        """)
            col5_3_l, col5_3_c, col5_3_r = st.columns([1, 2, 1])
            with col5_3_l:
                if st.button(f"▶️ 음성으로 듣기", key='q5_3', use_container_width=True):
                    autoplay_audio('./ref/contents/q5_3.mp3')
            with col5_3_r:
                if st.button("듣기 중단", key='q5_3_stop', use_container_width=True):
                    stop_audio()
            
            # 내용 5-4
            st.markdown(
        """
        #### Q. 백내장 수술 전에 복용하지 말아야 할 약제가 있을까요?

        - 혈압약, 당뇨약, 항응고제 등 대부분의 약제는 수술 당일에도 복용 가능합니다. 다만, 일부 환자의 경우에는 백내장 수술에 영향을 미치는 약제가 있을 수 있으므로, 수술 전 주치의나 수술 코디네이터에게 꼭 알려주시기 바랍니다.

        """)
            col5_4_l, col5_4_c, col5_4_r = st.columns([1, 2, 1])
            with col5_4_l:
                if st.button(f"▶️ 음성으로 듣기", key='q5_4', use_container_width=True):
                    autoplay_audio('./ref/contents/q5_4.mp3')
            with col5_4_r:
                if st.button("듣기 중단", key='q5_4_stop', use_container_width=True):
                    stop_audio()
            
            st.markdown('---')
            down1, down2, down3 = st.columns([1, 1, 1.2])
            with down1 :
                disable_step_5_again = True if st.session_state['progress'] > 5 else False
                unlock_step_6 = st.button("확인하였습니다.",type='primary', key="to_step_6", disabled=disable_step_5_again)
                if unlock_step_6:
                    st.session_state['current_step'] = 6
                    st.session_state['progress'] += 1
                    st.session_state['stay']["step5"]['duration'] = int(time.time() - st.session_state['stay']['step5']['start'])
                    st.rerun()

            with down3:
                if st.button("전체 다시 듣기", use_container_width=True):
                    st.session_state["speech_mode"] = True
                    st.session_state["listen"]["step5"] = False
                    st.rerun()
                    
    elif st.session_state['current_step'] == 6:
        if "step6" not in st.session_state['stay']:
            st.session_state['stay']['step6'] = dict()
            st.session_state['stay']['step6']['start'] = time.time()
            # st.session_state['stay']['step6']['duration'] = 0

        if "step6" not in st.session_state["listen"].keys():
            st.session_state["listen"]["step6"] = False
        
        if st.session_state["speech_mode"] == True and st.session_state["listen"]["step6"] == False:
            st.session_state["listen"]["step6"] = True
            up, _ = st.columns([1,3])
            with up:
                stop_audio_btn6 = st.button("음성 모드 중지", key="up6", use_container_width=True)
            
            audio_files = ['./ref/contents/q6_1.mp3']
            script1 = [
                {"text": "#### Q. 수술 후 주의해야 할 것에는 무엇이 있나요?  \n\n", "time": 0},
                {"text": "- 수술 이후에는 다음과 같은 사항을 꼭 지켜주셔야 합니다.\n", "time": 4},
                {"text": "1) **눈은 절대로 비비지 않습니다.**\n", "time": 9},
                {"text": "2) **일주일 간 세수, 샤워를 삼가야 합니다.**\n", "time": 12},
                {"text": "3) **한달 간 수영장, 목욕탕, 사우나 출입을 삼가야 합니다.**\n", "time": 17},
                {"text": "4) **용법에 맞게 안약을 반드시 점안하며, 점안 전 후로 손을 깨끗하게 닦아야 합니다.**\n", "time": 23},
                {"text": "5) **수술받은 눈이 눌리거나 부딪히지 않도록 주의해야 합니다.**\n", "time": 30},
                {"text": "6) **심한 통증이나 충혈, 급격한 시력 저하 등 감염징후가 나타나면 외래나 응급실로 바로 내원하셔야 합니다.**\n", "time": 35},
                {"text": "\n", "time": 44}
            ]

            scripts = [script1]
            full_text_container = st.empty()
            full_text = ""
            stream_text_container = st.empty()
            for audio_file, script in zip(audio_files, scripts):
                autoplay_audio(audio_file)
                if stop_audio_btn6:
                    st.session_state["speech_mode"] = False
                    st.rerun()
                    stop_audio()
                start_time = time.time()
                for item in script:
                    while time.time() - start_time < item["time"]:
                        time.sleep(0.1)
                    
                    for data in stream_partial_data([item]):
                        if stop_audio_btn6:
                            stop_audio()
                            break
                        stream_text_container.markdown(data, unsafe_allow_html=True)
                    
                    if stop_audio_btn6:
                        stop_audio()
                        break
                    time.sleep(0.5)
                    stream_text_container.empty()
                    full_text += item["text"]
                    full_text_container.markdown(full_text, unsafe_allow_html=True)

                if stop_audio_btn6:
                    stop_audio()
                    break
            stream_text_container.empty()
            full_text_container.empty()

        if not personalized or 'patient_info' not in st.session_state or st.session_state['patient_info'] == None:
            st.error("회원정보를 먼저 등록해주십시오.")

        else:
            st.markdown(
            """
            #### Q. 수술 후 주의해야 할 것에는 무엇이 있나요?
            - 수술 이후에는 다음과 같은 사항을 꼭 지켜주셔야 합니다.

            1) **눈은 절대로 비비지 않습니다.**
            2) **일주일 간 세수, 샤워를 삼가야 합니다.**
            3) **한달 간 수영장, 목욕탕, 사우나 출입을 삼가야 합니다.**
            4) **용법에 맞게 안약을 반드시 점안하며, 점안 전 후로 손을 깨끗하게 닦아야 합니다.**
            5) **수술받은 눈이 눌리거나 부딪히지 않도록 주의해야 합니다.**
            6) **심한 통증이나 충혈, 급격한 시력 저하 등 감염징후가 나타나면 외래나 응급실로 바로 내원하셔야 합니다.**
            """)
            col6_1_l, col6_1_c, col6_1_r = st.columns([1, 2, 1])
            with col6_1_l:
                if st.button(f"▶️ 음성으로 듣기", key='q6_1', use_container_width=True):
                    autoplay_audio('./ref/contents/q6_1.mp3')
            with col6_1_r:
                if st.button("듣기 중단", key='q6_1_stop', use_container_width=True):
                    stop_audio()

            st.write("---")
            diag = st.session_state['patient_info']['diagnosis']
            patient_name = st.session_state['patient_info']['patient_name']
            with st.container():
                # st.write(st.session_state['patient_info']['diagnosis'])
                st.subheader(f"{patient_name}님의 백내장 수술 전 요약")
                contents = personalized_diagnosis(diag, patient_name)
                st.write(contents)

                with st.container(border=True):
                    explain = st.session_state["patient_info"]["explain"]
                    explain = explain.replace("#","")
                    st.write("**환자 상태에 관한 인공지능 소견**")
                    st.write(explain)

                # st.write("---")
                # st.write("#### 세부 내용")

                # for cat, details in diag.items():
                #     if len(details) == 0:
                #         continue
                #     with st.container(border=True):
                #         st.write(f"**{cat} 이상**")
                #         for detail in details:    
                #             res = supabase.table("diagnosis").select("explain").eq("diag", detail).execute()
                #             raw = res.data[0]['explain'].replace("{patient}", patient_name)
                #             st.write(raw)
                #             st.write("---")
            
            st.write("---")
            st.subheader(f"{patient_name}님의 수술 전후 스케줄")
            surgery_date = st.session_state['patient_info']["surgery_date"].strftime("%Y-%m-%d")
            surgery_time = st.session_state['patient_info']["surgery_time"].strftime("%H-%M-%S")
            
            day_before = (st.session_state['patient_info']["surgery_date"] - timedelta(days=1)).strftime("%Y-%m-%d")
            day_after = (st.session_state['patient_info']["surgery_date"] + timedelta(days=1)).strftime("%Y-%m-%d")
            week_after = (st.session_state['patient_info']["surgery_date"] + timedelta(weeks=1)).strftime("%Y-%m-%d")
            month_after = (st.session_state['patient_info']["surgery_date"] + relativedelta(months=1)).strftime("%Y-%m-%d")
            
            calendar_options = {
            "editable": "False",
            "navLinks": "true",
            "selectable": "true",
            "headerToolbar": {
                        "left": "today prev,next",
                        "center": "title",
                        "right": "dayGridDay,dayGridWeek,dayGridMonth",
                    },
            "initialDate": datetime.today().strftime("%Y-%m-%d"),
            "initialView": "dayGridMonth"
            }

            # 수술 당일
            events= []
            events.append({
                "title": "수술 당일",
                "color": "#FF6C6C",
                "start": surgery_date,
                "end": surgery_date,
            })
            events.append({
                "title": "수술",
                "color": "#FF6C6C",
                "start": surgery_date + "T" + surgery_time,
                "end": surgery_date + "T" + str(int(surgery_time[:2]) + 1) + surgery_time[2:],
            })

            # 수술 하루전 
            events.append({
                "title": "수술 하루 전",
                "color": "#FFBD45",
                "start": day_before,
                "end": day_before,
            })

            # 수술 하루 후 
            events.append({
                "title": "수술 하루 후",
                "color": "#FFBD45",
                "start": day_after,
                "end": day_after,
            })

            # 수술 일주일 뒤
            events.append({
                "title": "수술 일주일 뒤",
                "color": "blue",
                "start": week_after,
                "end": week_after,
            })

            # 수술 한달 뒤
            events.append({
                "title": "수술 한달 뒤",
                "color": "green",
                "start": month_after,
                "end": month_after,
            })

            state = calendar(
                events=events,
                options=calendar_options,
                custom_css="""
                .fc-event-past {
                    opacity: 0.8;
                }
                .fc-event-time {
                    font-style: italic;
                }
                .fc-event-title {
                    font-weight: 700;
                }
                .fc-toolbar-title {
                    font-size: 2rem;
                }
                """
            )
            # st.write(state)

            st.write(f"""
            - **{day_before}**) **수술 하루 전** : 내원 시간 안내
            - **{surgery_date}**) :red[**수술 당일**] 
                + 아침까지 약 복용
                + 당일 입원 & 당일 퇴원
                + 일주일 간 세수, 샤워 불가능
            - **{day_after}**) **수술 하루 뒤** : 외래 내원 (수술 후 상태확인)
            - **{week_after}**) **수술 일주일 뒤** : 외래 내원 (수술 후 상태확인)
                + 세수, 샤워 가능
            - **{month_after}**) **수술 한달 뒤** : 외래 내원 (수술 후 상태확인)
                + 안약 중단
                + 수술 후 도수 및 시력이 안정화되는 시기
            """
            )
            
            st.markdown('---')
            down1, down2, down3 = st.columns([1, 1, 1.2])
            with down1 :
                disable_step_6_again = True if st.session_state['progress'] > 6 else False
                unlock_step_done = st.button("확인하였습니다.",type='primary', key="to_step_done", disabled=disable_step_6_again)
                if unlock_step_done:
                    st.session_state['current_step'] = 6
                    st.session_state['progress'] += 1
                    st.session_state['stay']["step6"]['duration'] = int(time.time() - st.session_state['stay']['step6']['start'])
                    st.rerun()

            with down3:
                if st.button("전체 다시 듣기", use_container_width=True):
                    st.session_state["speech_mode"] = True
                    st.session_state["listen"]["step6"] = False
                    st.rerun()

    
    st.markdown('---')
    disable_back_button = True if st.session_state['current_step'] == 0 else False
    if st.session_state['current_step'] == 6 or st.session_state['current_step'] >= st.session_state['progress']:
        disable_next_button = True
    else:
        disable_next_button = False
    # disable_next_button = True if st.session_state['current_step'] == 6 else False

    form_footer_cols = st.columns([1,5,1])

    form_footer_cols[0].button('이전',on_click=set_form_step, args=['Back'], disabled=disable_back_button)
    form_footer_cols[2].button('다음',on_click=set_form_step, args=['Next'], disabled=disable_next_button)

def personalized_diagnosis(diag, patient_name):

    # 16가지 + alpha
    # (1) 전방-수정체가 선택된 경우
    if len(diag["전방"]) != 0 or len(diag["수정체"]) != 0:
        # cat-(1)파악
        cat_1 = find_cat_1(len(diag["전방"]), len(diag["수정체"]))
        # 심한 백내장이 포함된 경우 확인
        cat_1_severe = True if "심한 백내장(백색, 갈색, 후낭하혼탁 포함)" in diag["수정체"] else False
        
        # (2) 각막이 선택된 경우
        if len(diag["각막"]) != 0:
            cat_2_severe = True if "내피세포 이상 1200개 미만" in diag["각막"] or  "내피세포 이상 1200~1500개" in diag["각막"] else False

            # (3) 망막-시신경이 선택된 경우
            if len(diag["망막"]) !=0 or len(diag["시신경"]):
                cat_3 = find_cat_3(len(diag["망막"]), len(diag["시신경"]))

                # (4) 전안부가 선택된 경우
                if len(diag["전안부"]) !=0:
                    # (1.전방-수정체) - (2.각막) - (3.망막-시신경) - (4.전안부)
                    cat = cat_1 + " 그리고 각막"
                    notes = f"""{patient_name}님은 일반적인 경우와 비교하여 **{cat}** 관련 위험요인(들)을 추가로 가지고 있는 상태입니다.
                    따라서 :red[백내장 수술의 난이도가 높고, 수술의 범위가 커질 가능성이 있습니다.]   
                    """
                    if cat_1_severe:
                        notes += """ :orange[심한 백내장을 제거하는 과정에서 나타나는 각막부종으로 인하여, 시력호전에 제한이 있을 수 있습니다.]"""
                    notes += f""" :blue[또한 {patient_name}께서 현재 가지고 계신 각막질환, {cat_3} 질환으로 인하여, 백내장 수술 후에도 시력호전에 제한이 있을 수 있습니다.]  
                    """
                    if cat_2_severe:
                        notes += """ :green[ 그리고 각막내피세포의 저하로 수술 이후 각막부종이 나타날 수 있으며, 이로 인한 시력저하가 지속될 시 각막이식술을 고려해야 할 수 있습니다.]"""
                    notes += """ :red[한편 수술 후 건성안 증상이 악화될 수 있어서 이에 대한 지속적인 관리가 필요합니다.]"""
                    notes += """  
                    **저희 세브란스 안과 병원 의료진은 이러한 위험요인들을 충분히 숙지하고 준비하겠습니다.**"""

                # (4)-else: 전안부가 선택되지 않은 경우
                else:
                    # (1.전방-수정체) - (2.각막) - (3.망막-시신경)
                    cat = cat_1 + " 그리고 각막"
                    notes = f"""{patient_name}님은 일반적인 경우와 비교하여 **{cat}** 관련 위험요인(들)을 추가로 가지고 있는 상태입니다.
                    따라서 :red[백내장 수술의 난이도가 높고, 수술의 범위가 커질 가능성이 있습니다.]  
                    """
                    if cat_1_severe:
                        notes += """ :orange[심한 백내장을 제거하는 과정에서 나타나는 각막부종으로 인하여, 시력호전에 제한이 있을 수 있습니다.]"""
                    notes += f""" :blue[또한 {patient_name}께서 현재 가지고 계신 각막질환, {cat_3} 질환으로 인하여, 백내장 수술 후에도 시력호전에 제한이 있을 수 있습니다.]  
                    """
                    if cat_2_severe:
                        notes += """ :green[ 그리고 각막내피세포의 저하로 수술 이후 각막부종이 나타날 수 있으며, 이로 인한 시력저하가 지속될 시 각막이식술을 고려해야 할 수 있습니다.]"""
                    notes += """  
                    **저희 세브란스 안과 병원 의료진은 이러한 위험요인들을 충분히 숙지하고 준비하겠습니다.**"""

            # (3)-else : 망막-시신경이 선택되지 않은 경우
            else:
                # (4) 전안부가 선택된 경우
                if len(diag["전안부"]) !=0:
                    # (1.전방-수정체) - (2.각막) - (4.전안부)
                    cat = cat_1 + " 그리고 각막"
                    notes = f"""{patient_name}님은 일반적인 경우와 비교하여 **{cat}** 관련 위험요인(들)을 추가로 가지고 있는 상태입니다.
                    따라서 :red[백내장 수술의 난이도가 높고, 수술의 범위가 커질 가능성이 있습니다.]  
                    """
                    if cat_1_severe:
                        notes += """ :orange[심한 백내장을 제거하는 과정에서 나타나는 각막부종으로 인하여, 시력호전에 제한이 있을 수 있습니다.]"""
                    notes += f""" :blue[또한 {patient_name}께서 현재 가지고 계신 각막질환으로 인하여, 백내장 수술 후에도 시력호전에 제한이 있을 수 있습니다.]  
                    """
                    if cat_2_severe:
                        notes += """ :green[그리고 각막내피세포의 저하로 수술 이후 각막부종이 나타날 수 있으며, 이로 인한 시력저하가 지속될 시 각막이식술을 고려해야 할 수 있습니다.]"""
                    notes += """ :red[한편 수술 후 건성안 증상이 악화될 수 있어서 이에 대한 지속적인 관리가 필요합니다.]"""
                    notes += """  
                    **저희 세브란스 안과 병원 의료진은 이러한 위험요인들을 충분히 숙지하고 준비하겠습니다.**"""

                # (4)-else: 전안부가 선택되지 않은 경우
                else:
                    # (1.전방-수정체) - (2.각막)
                    cat = cat_1 + " 그리고 각막"
                    notes = f"""{patient_name}님은 일반적인 경우와 비교하여 **{cat}** 관련 위험요인(들)을 추가로 가지고 있는 상태입니다.
                    따라서 :red[백내장 수술의 난이도가 높고, 수술의 범위가 커질 가능성이 있습니다.]  
                    """
                    if cat_1_severe:
                        notes += """  :orange[심한 백내장을 제거하는 과정에서 나타나는 각막부종으로 인하여, 시력호전에 제한이 있을 수 있습니다.]"""
                    notes += f""" :blue[또한 {patient_name}께서 현재 가지고 계신 각막질환으로 인하여, 백내장 수술 후에도 시력호전에 제한이 있을 수 있습니다.]  
                    """
                    if cat_2_severe:
                        notes += """ :green[그리고 각막내피세포의 저하로 수술 이후 각막부종이 나타날 수 있으며, 이로 인한 시력저하가 지속될 시 각막이식술을 고려해야 할 수 있습니다.]"""
                    notes += """  
                    **저희 세브란스 안과 병원 의료진은 이러한 위험요인들을 충분히 숙지하고 준비하겠습니다.**"""

        # (2)-else : 각막이 선택되지 않은 경우
        else:
            # (3) 망막-시신경이 선택된 경우
            if len(diag["망막"]) !=0 or len(diag["시신경"]):
                cat_3 = find_cat_3(len(diag["망막"]), len(diag["시신경"]))

                # (4) 전안부가 선택된 경우
                if len(diag["전안부"]) !=0:
                    # (1.전방-수정체) - (3.망막-시신경) - (4.전안부)
                    cat = cat_1
                    notes = f"""{patient_name}님은 일반적인 경우와 비교하여 **{cat}** 관련 위험요인(들)을 추가로 가지고 있는 상태입니다.
                    따라서 :red[백내장 수술의 난이도가 높고, 수술의 범위가 커질 가능성이 있습니다.]"""
                    if cat_1_severe:
                        notes += """  :orange[심한 백내장을 제거하는 과정에서 나타나는 각막부종으로 인하여, 시력호전에 제한이 있을 수 있습니다.]"""
                    notes += f"""  :blue[또한 {patient_name}께서 현재 가지고 계신 {cat_3} 질환으로 인하여, 백내장 수술 후에도 시력호전에 제한이 있을 수 있습니다.]  
                    """
                    notes += """ :red[한편 수술 후 건성안 증상이 악화될 수 있어서 이에 대한 지속적인 관리가 필요합니다.]"""
                    notes += """  
                    **저희 세브란스 안과 병원 의료진은 이러한 위험요인들을 충분히 숙지하고 준비하겠습니다.**"""
                    
                # (4)-else: 전안부가 선택되지 않은 경우
                else:
                    # (1.전방-수정체) - (3.망막-시신경)
                    cat = cat_1
                    notes = f"""{patient_name}님은 일반적인 경우와 비교하여 **{cat}** 관련 위험요인(들)을 추가로 가지고 있는 상태입니다.
                    따라서 :red[백내장 수술의 난이도가 높고, 수술의 범위가 커질 가능성이 있습니다.]  
                    """
                    if cat_1_severe:
                        notes += """ :orange[심한 백내장을 제거하는 과정에서 나타나는 각막부종으로 인하여, 시력호전에 제한이 있을 수 있습니다.]"""
                    notes += f""" :blue[또한 {patient_name}께서 현재 가지고 계신 {cat_3} 질환으로 인하여, 백내장 수술 후에도 시력호전에 제한이 있을 수 있습니다.]  
                    """
                    notes += """  
                    **저희 세브란스 안과 병원 의료진은 이러한 위험요인들을 충분히 숙지하고 준비하겠습니다.**"""

            # (3)-else : 망막-시신경이 선택되지 않은 경우
            else:
                # (4) 전안부가 선택된 경우
                if len(diag["전안부"]) !=0:
                    # (1.전방-수정체) - (4.전안부)
                    cat = cat_1
                    notes = f"""{patient_name}님은 일반적인 경우와 비교하여 **{cat}** 관련 위험요인(들)을 추가로 가지고 있는 상태입니다.
                    따라서 :red[백내장 수술의 난이도가 높고, 수술의 범위가 커질 가능성이 있습니다.]  
                    """
                    if cat_1_severe:
                        notes += """ :orange[심한 백내장을 제거하는 과정에서 나타나는 각막부종으로 인하여, 시력호전에 제한이 있을 수 있습니다.]"""
                    notes += """ :red[한편 수술 후 건성안 증상이 악화될 수 있어서 이에 대한 지속적인 관리가 필요합니다.]"""
                    notes += """  
                    **저희 세브란스 안과 병원 의료진은 이러한 위험요인들을 충분히 숙지하고 준비하겠습니다.**"""
                    
                # (4)-else: 전안부가 선택되지 않은 경우
                else:
                    # (1.전방-수정체)
                    cat = cat_1
                    notes = f"""{patient_name}님은 일반적인 경우와 비교하여 **{cat}** 관련 위험요인(들)을 추가로 가지고 있는 상태입니다.
                    따라서 :red[백내장 수술의 난이도가 높고, 수술의 범위가 커질 가능성이 있습니다.]  
                    """
                    if cat_1_severe:
                        notes += """ :orange[심한 백내장을 제거하는 과정에서 나타나는 각막부종으로 인하여, 시력호전에 제한이 있을 수 있습니다.]"""
                    notes += """  
                    **저희 세브란스 안과 병원 의료진은 이러한 위험요인들을 충분히 숙지하고 준비하겠습니다.**"""


    # (1)-else : 전방 수정체가 선택되지 않은 경우
    else:
        # (2) 각막이 선택된 경우
        if len(diag["각막"]) != 0:
            cat_2_severe = True if "내피세포 이상 1200개 미만" in diag["각막"] or  "내피세포 이상 1200~1500개" in diag["각막"] else False

            # (3) 망막-시신경이 선택된 경우
            if len(diag["망막"]) !=0 or len(diag["시신경"]):
                cat_3 = find_cat_3(len(diag["망막"]), len(diag["시신경"]))

                # (4) 전안부가 선택된 경우
                if len(diag["전안부"]) !=0:
                    # (2.각막) - (3.망막-시신경) - (4.전안부)
                    notes = f"""{patient_name}님은 일반적인 경우와 비교하여 **각막** 관련 위험요인(들)을 추가로 가지고 있는 상태입니다.
                    따라서 :red[백내장 수술의 난이도가 높고, 수술의 범위가 커질 가능성이 있습니다.]  
                    """
                    if cat_2_severe:
                        notes += """ :green[각막내피세포의 저하로 수술 이후 각막부종이 나타날 수 있으며, 이로 인한 시력저하가 지속될 시 각막이식술을 고려해야 할 수 있습니다.]"""
                    
                    notes += f""" :blue[{patient_name}께서 현재 가지고 계신 각막질환, {cat_3} 질환으로 인하여, 백내장 수술 후에도 시력호전에 제한이 있을 수 있습니다.]  
                    """
                    notes += """ :red[한편 수술 후 건성안 증상이 악화될 수 있어서 이에 대한 지속적인 관리가 필요합니다.]"""
                    notes += """  
                    **저희 세브란스 안과 병원 의료진은 이러한 위험요인들을 충분히 숙지하고 준비하겠습니다.**"""
                    
                # (4)-else: 전안부가 선택되지 않은 경우
                else:
                    # (2.각막) - (3.망막-시신경)
                    notes = f"""{patient_name}님은 일반적인 경우와 비교하여 **각막** 관련 위험요인(들)을 추가로 가지고 있는 상태입니다.
                    따라서 :red[백내장 수술의 난이도가 높고, 수술의 범위가 커질 가능성이 있습니다.]"""
                    if cat_2_severe:
                        notes += """ :green[각막내피세포의 저하로 수술 이후 각막부종이 나타날 수 있으며, 이로 인한 시력저하가 지속될 시 각막이식술을 고려해야 할 수 있습니다.]"""
                    notes += f""" :blue[{patient_name}께서 현재 가지고 계신 각막질환, {cat_3} 질환으로 인하여, 백내장 수술 후에도 시력호전에 제한이 있을 수 있습니다.]  
                    """
                    notes += """  
                    **저희 세브란스 안과 병원 의료진은 이러한 위험요인들을 충분히 숙지하고 준비하겠습니다.**"""

            # (3)-else : 망막-시신경이 선택되지 않은 경우
            else:
                # (4) 전안부가 선택된 경우
                if len(diag["전안부"]) !=0:
                    # (2.각막) - (4.전안부)
                    notes = f"""{patient_name}님은 일반적인 경우와 비교하여 **각막** 관련 위험요인(들)을 추가로 가지고 있는 상태입니다.
                    따라서 :red[백내장 수술의 난이도가 높고, 수술의 범위가 커질 가능성이 있습니다.]  
                    """
                    if cat_2_severe:
                        notes += """ :green[각막내피세포의 저하로 수술 이후 각막부종이 나타날 수 있으며, 이로 인한 시력저하가 지속될 시 각막이식술을 고려해야 할 수 있습니다.]"""
                    notes += f""" :blue[{patient_name}께서 현재 가지고 계신 각막질환으로 인하여, 백내장 수술 후에도 시력호전에 제한이 있을 수 있습니다.]  
                    """
                    notes += """ :red[한편 수술 후 건성안 증상이 악화될 수 있어서 이에 대한 지속적인 관리가 필요합니다.]"""
                    notes += """  
                    **저희 세브란스 안과 병원 의료진은 이러한 위험요인들을 충분히 숙지하고 준비하겠습니다.**"""
                    
                # (4)-else: 전안부가 선택되지 않은 경우
                else:
                    # (2.각막)
                    notes = f"""{patient_name}님은 일반적인 경우와 비교하여 **각막** 관련 위험요인(들)을 추가로 가지고 있는 상태입니다.
                    따라서 :red[백내장 수술의 난이도가 높고, 수술의 범위가 커질 가능성이 있습니다.]"""
                    if cat_2_severe:
                        notes += """ :green[각막내피세포의 저하로 수술 이후 각막부종이 나타날 수 있으며, 이로 인한 시력저하가 지속될 시 각막이식술을 고려해야 할 수 있습니다.]"""
                    notes += f""" :blue[{patient_name}께서 현재 가지고 계신 각막질환으로 인하여, 백내장 수술 후에도 시력호전에 제한이 있을 수 있습니다.]  
                    """
                    notes += """  
                    **저희 세브란스 안과 병원 의료진은 이러한 위험요인들을 충분히 숙지하고 준비하겠습니다.**"""

        # (2)-else : 각막이 선택되지 않은 경우
        else:
            # (3) 망막-시신경이 선택된 경우
            if len(diag["망막"]) !=0 or len(diag["시신경"]):
                cat_3 = find_cat_3(len(diag["망막"]), len(diag["시신경"]))

                # (4) 전안부가 선택된 경우
                if len(diag["전안부"]) !=0:
                    # (3.망막-시신경) - (4.전안부)
                    notes = f"""{patient_name}님께서는 백내장 수술의 위험성이 낮고, 합병증 발생 가능성이 높지 않은 상태입니다.
                    하지만 :blue[백내장 수술 후에도 {cat_3} 질환으로 인해 시력호전에 제한이 있을 수 있습니다.]  
                    """
                    notes += """ :red[또한 수술 후 건성안 증상이 악화될 수 있어서 이에 대한 지속적인 관리가 필요합니다.]"""
                # (4)-else: 전안부가 선택되지 않은 경우
                else:
                    # (3.망막-시신경)
                    notes = f"""{patient_name}님께서는 백내장 수술의 위험성이 낮고, 합병증 발생 가능성이 높지 않은 상태입니다.
                    하지만 :blue[백내장 수술 후에도 {cat_3} 질환으로 인해 시력호전에 제한이 있을 수 있습니다.]  
                    """

            # (3)-else : 망막-시신경이 선택되지 않은 경우
            else:
                # (4) 전안부가 선택된 경우
                if len(diag["전안부"]) !=0:
                    # (4.전안부)
                    notes = f"""{patient_name}님께서는 백내장 수술의 위험성이 낮고, 합병증 발생 가능성이 높지 않은 상태입니다.
                    하지만 :red[수술 후 건성안 증상이 악화될 수 있어서 이에 대한 지속적인 관리가 필요합니다.]  
                    """
                    
                # (4)-else: 전안부가 선택되지 않은 경우
                else:
                    # 선택사항 없음
                    notes = f"""{patient_name}님께서는 백내장 수술의 위험성이 낮고, 합병증 발생 가능성이 높지 않은 상태입니다."""
    
    return notes

# 카테고리-(1) 확인 : 전방(chamber), 수정체(lens)
def find_cat_1(l_chamber, l_lens):
    if l_lens == 0:
        cat_1 = "전방"
    elif l_chamber == 0:
        cat_1 = "수정체"
    else:
        cat_1 = "전방 및 수정체"
    
    return cat_1

# 카테고리-(3) 확인 : 망막(retina), 시신경(nerve)
def find_cat_3(l_retina, l_nerve):
    if l_nerve == 0:
        cat_3 = "망막"
    elif l_retina == 0:
        cat_3 = "녹내장"
    else:
        cat_3 = "망막 및 녹내장"

    return cat_3
