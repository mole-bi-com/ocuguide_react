import streamlit as st
import pandas as pd
from page2 import style_dataframe
import matplotlib.pyplot as plt

def statistics():
    st.title("✨ OcuGUIDE 사용내역")

    st.subheader("현재 OcuGUIDE 접속 환자 정보")

    if 'patient_info' not in st.session_state:
        st.warning("👨‍⚕️ 환자정보 입력에서 환자 정보를 먼저 등록해주세요.")
    elif st.session_state['patient_info'] == None:
        st.warning("👨‍⚕️ 환자정보 입력에서 환자 정보를 먼저 등록해주세요.")
    else:
        info = st.session_state['patient_info']
        patient_personal_data = {
            "환자번호": [f"{info['patient_number']}"],
            "이름": [f"{info['patient_name']}"],
            
            "성별": [f"{info['gender']}"],
            "생년월일": [f"{info['birth_date']}"],
            "나이": [f"{info['age']}"]
        }
        patient_operation_data = {
            "주치의": [f"{info['primary_doctor']}"],
            "수술부위": [f"{info['surgery_eye']}"],
            
            "수술날짜": [f"{info['surgery_date']}"],
            "수술 시간": [f"{info['surgery_time']}"]
        }
        df_patient_personal = style_dataframe(pd.DataFrame(patient_personal_data), '#F5F5DC')
        df_patient_operation = style_dataframe(pd.DataFrame(patient_operation_data), '#FAEBD7')
        
        st.markdown("### 등록된 환자정보")
        st.markdown(df_patient_personal.to_html(), unsafe_allow_html=True)
        st.markdown(df_patient_operation.to_html(), unsafe_allow_html=True)
    
    st.markdown("---")
    st.subheader("ℹ️ 백내장수술정보 진행 단계")
    if 'patient_info' not in st.session_state:
        st.warning("👨‍⚕️ 환자정보 입력에서 환자 정보를 먼저 등록해주세요.")
    elif st.session_state['patient_info'] == None:
        st.warning("👨‍⚕️ 환자정보 입력에서 환자 정보를 먼저 등록해주세요.")
    else:
        if 'progress' not in st.session_state:
            st.warning("ℹ️ 백내장수술정보에서 필요한 정보 확인을 시작하세요.")
        else:
            progress = st.session_state["progress"]
            if progress < 7:
                st.info(f"현재 {progress}까지 정보를 확인하였습니다.")
            else:
                st.success("모든 백내장수술정보를 확인하였습니다.")

                # st.write(st.session_state['stay'])
                data = {'step(1)': st.session_state['stay']["step1"]['duration'], 
                        'step(2)': st.session_state['stay']["step2"]['duration'], 
                        'step(3)': st.session_state['stay']["step3"]['duration'], 
                        'step(4)': st.session_state['stay']["step4"]['duration'], 
                        'step(5)': st.session_state['stay']["step5"]['duration'], 
                        'step(6)': st.session_state['stay']["step6"]['duration']
                        }

                steps = list(data.keys())
                times = list(data.values())
                
                colors = ['blue', 'green', 'red', 'purple', 'orange', 'blue']

                fig, ax = plt.subplots(figsize=(10, 6))
                ax.bar(steps, times, color=colors)
                # ax.set_xlabel('Steps')
                ax.set_ylabel('Time (seconds)')
                # ax.set_title('백내장수술정보 단계별 체류시간')
                # ax.set_xticklabels(steps, rotation=45)

                st.pyplot(fig)
                
                st.write("##### 백내장 수술정보 단계별 체류시간(초) #####")
                st.write(f""" 
                         - :blue[**단계 1)**] 백내장의 정의, 수술 과정 : {data['step(1)']}초
                         - :green[**단계 2)**] 인공수정체 결정 : {data['step(2)']}초
                         - :red[**단계 3)**] 백내장 수술 후 시력, 일상생활 : {data['step(3)']}초
                         - :violet[**단계 4)**] 백내장 수술의 합병증과 부작용 : {data['step(4)']}초
                         - :orange[**단계 5)**] 빈번한 질문 리스트 : {data['step(5)']}초
                         - :blue[**단계 6)**] 수술 후 주의사항 : {data['step(6)']}초

                         """)