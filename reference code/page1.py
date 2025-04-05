import streamlit as st

def page_home():
        
    st.write("# :green[백내장 길라잡이] OcuGUIDE :eye-in-speech-bubble:")

    st.sidebar.success("필요한 단계를 위에서 선택하세요.")

    st.subheader("OcuGuide에 오신 것을 환영합니다.")
    st.markdown("""
                **OcuGuide :eye-in-speech-bubble:는 :blue[세브란스] 안과 전문 의료진과 함께 백내장 수술에 대한 맞춤형 정보를 제공하여, 환자분들의 건강과 회복을 돕기 위한 서비스입니다.**
                이곳에서 제공하는 자료와 맞춤형 정보로 백내장 수술을 준비하고, 궁금한 사항에 대해 자유롭게 문의하세요.
                """)
    st.subheader("OcuGuide의 주요 기능")
    st.write("""
         - ✔️ **환자 맞춤형 정보**: 초기 검사결과를 기반으로 환자 개개인에게 맞춤형 정보를 제공합니다.
         - ℹ️  **수술 안내 정보**: 백내장 수술 과정과 주의사항에 대해 단계별로 안내합니다.
         - ❔ **전문 의료진과의 소통**: 챗봇을 통해 궁금한 사항에 대해 신속하게 답변을 받을 수 있습니다.
         """)
    st.subheader("최고의 의료 지식과 경험")
    st.write("""
    [세브란스 안과병원](https://sev-eye.severance.healthcare/sev-eye/index.do)은 최신 의료 지식과 최고의 수술 경험을 바탕으로 환자들에게 신뢰할 수 있는 정보를 제공합니다.
    """)
    col1, col2 = st.columns(2)
    with col2:
        st.image("./ref/sev-eye_logo@2x.png")
    with col1:
        st.image("./ref/ocuguide_logo@2x.png")    
    st.markdown("---")