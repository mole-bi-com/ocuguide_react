import streamlit as st
import streamlit_authenticator as stauth

# 페이지 설정
st.set_page_config(
    page_title="OcuGuide",
    page_icon=":clap:"
    )

from page1 import page_home
from page2 import page_input
from page3 import page_info
from page4 import page_w_chatgpt
# from page5 import page_w_rag
from page6 import statistics

# 로그인 페이지와 로그인 정보를 위한 인증 객체
def init_session():
    authenticator = stauth.Authenticate(
        st.secrets['credentials'].to_dict(),
        st.secrets['cookie']['name'],
        st.secrets['cookie']['key'],
        st.secrets['cookie']['expiry_days'],
        st.secrets['preauthorized']
    )

    return authenticator

def app():

    auth= init_session()
    login_result = auth.login('main')

    if login_result:
        name = login_result.name
        authentication_status = login_result.authentication_status
        username = login_result.username
        st.session_state["authentication_status"] = authentication_status
        st.sidebar.markdown("## :male-doctor:백내장의 모든 것:female-doctor: OcuGUIDE ##")
    
    elif st.session_state.get("authentication_status") == False:
        st.error("Username/password is incorrect")
    elif st.session_state.get("authentication_status") == None:
        st.warning("Please enter your username and password")
    
    if st.session_state.get("authentication_status"):
        
        st.sidebar.markdown("## :male-doctor:백내장의 모든 것:female-doctor: OcuGUIDE ##")
        st.sidebar.image("ref/side_logo.png")
        if 'page' not in st.session_state:
            st.session_state["page"] = "HOME"

        menu = ["HOME", "👨‍⚕️ 환자정보 입력", "ℹ️ 백내장수술정보","❔ Q&A 챗봇", "✨ OcuGUIDE 사용내역"]
        page = st.sidebar.selectbox("원하시는 과정을 선택하세요", menu, index=menu.index(st.session_state.page))

        if page == "HOME":
            st.session_state["page"]= "HOME"
        elif page == "👨‍⚕️ 환자정보 입력":
            st.session_state["page"] = "👨‍⚕️ 환자정보 입력"
        elif page == "ℹ️ 백내장수술정보":
            st.session_state["page"]= "ℹ️ 백내장수술정보"
        elif page == "❔ Q&A 챗봇":
            st.session_state["page"] = "❔ Q&A 챗봇"
        # elif page == "❓ Q&A [OcuGuide]":
        #     st.session_state["page"] = "❓ Q&A [OcuGuide]"
        elif page == "✨ OcuGUIDE 사용내역":
            st.session_state["page"] = "✨ OcuGUIDE 사용내역"
        

        # rendering
        if st.session_state["page"] == "HOME":
            page_home()
        elif st.session_state["page"] == "👨‍⚕️ 환자정보 입력":
            page_input()
        elif st.session_state["page"] == "ℹ️ 백내장수술정보":
            page_info()
        elif st.session_state["page"] == "❔ Q&A 챗봇":
            page_w_chatgpt()
        # elif st.session_state["page"] == "❓ Q&A [OcuGuide]":
        #     page_w_rag()
        elif st.session_state["page"] == "✨ OcuGUIDE 사용내역":
            statistics()
        

        if 'speech_mode' not in st.session_state:
            st.session_state['speech_mode'] = True
        toggle_button = st.sidebar.toggle("음성모드", value=st.session_state['speech_mode'])
        st.session_state['speech_mode'] = toggle_button

        auth.logout('Logout', 'sidebar')

    elif st.session_state["authentication_status"] == False:
        st.error("Username/password is incorrect")
    elif st.session_state["authentication_status"] == None:
        st.warning("Please enter your username and password")

if __name__ == '__main__':
    app()
