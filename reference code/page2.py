import streamlit as st
from datetime import datetime, timedelta, time
import pandas as pd
from helper import supabase, diagnosis_draft, diagnosis_draft_2

# 환자 입력에 필요한 정보를 불러온다.
@st.cache_resource(ttl=600)
def run_related_query():
    doctor = supabase.table("doctor").select("*").execute()
    return doctor

# 화면에 표시 및 이후 활용을 위하여, 등록된 정보를 메시지로 추출
def pick_patient_info(patient_info):
    name = patient_info["patient_name"]
    gender = patient_info["gender"]
    # birthday = patient_info["birth_date"]
    age = patient_info["age"]
    eye = patient_info["surgery_eye"]
    diagnosis = patient_info["diagnosis"]
    operation_day = patient_info["surgery_date"]
    today = datetime.today().strftime("%Y-%m-%d")
    msg = f"""환자의 정보는 다음과 같습니다.
    이름 : {name}, 성별 : {gender}, 나이 : {age}, 수술부위 : {eye}, 검사 결과 : {diagnosis}, 오늘 날짜: {today}, 수술 날짜: {operation_day}"""
    return msg

def style_dataframe(df, color):
    return df.style.set_table_styles(
        [{
            'selector': 'th',
            'props': [
                ('background-color', color),
                ('color', 'black'),
                ('font-family', 'Arial, sans-serif'),
                ('font-size', '16px')
            ]
        }, 
        {
            'selector': 'td, th',
            'props': [
                ('border', f'2px solid {color}')
            ]
        }]
    ).hide(axis="index")

# 환자 정보 등록
def page_input():    
    st.write("# :male-doctor: 환자 정보 등록")
    st.sidebar.success("환자별 맞춤 안내를 제공합니다.")

    # 세션에 환자 정보 저장 키 여부 확인
    if 'patient_info' not in st.session_state:
        st.session_state['patient_info'] = None

    # 환자 등록이 완료된 경우, 등록된 정보를 보여준다.
    if st.session_state['patient_info']:
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

        with st.container(border=True):
            st.write("#### 등록된 1차 소견")
            for k, v in info["diagnosis"].items():
                if len(v) != 0:
                    st.markdown(f"- {k}: {v}")

        # 검사결과를 바탕으로 종합소견을 생성하지만, 화면에 보여주지는 않는다.
        if 'explain' not in st.session_state["patient_info"]:
            st.session_state['patient_info']["explain"] = None

            with st.spinner('검사 결과를 바탕으로 진단을 내리는 중입니다...'):
                # 등록된 정보를 바탕으로, LLM 소견정보 생성
                picked_info = pick_patient_info(info)
                msg = {"role": "user", "content": picked_info}
                explain = diagnosis_draft_2(msg)
                explain = explain.replace("#","")
                
                st.session_state["patient_info"]["explain"] = explain
        else:
            explain = st.session_state["patient_info"]["explain"]
        
        st.success(' 환자정보가 등록되었습니다. 이제 :red[**백내장 수술정보**]로 이동하실 수 있습니다.', icon="✅")
        st.session_state["listen"] = dict()
    
        st.markdown('---')

        down1, down2, down3 = st.columns([1, 1, 1.5])
        with down1 :
            # 또다른 환자 정보를 등록할 때, 기존 정보를 리셋한다.
            if st.button("환자 정보 재등록", use_container_width=True):
                # reset_info()
                ask()
        
        with down3:
            if st.button("백내장 수술 정보로 이동", type='primary', use_container_width=True):
                st.session_state["page"] = "ℹ️ 백내장수술정보"
                st.rerun()
            
    # 새로운 환자 정보를 등록한다.
    else:
        input_patient_info()

@st.dialog("환자 정보를 재등록하시겠습니까?")
def ask():
    st.write("환자 정보를 정말 재등록 하시겠습니까?")
    c1, c2, c3 = st.columns([1, 1, 1])
    with c1:
        if st.button("확인",type='primary', use_container_width=True):
            reset_info()
    with c3:
        if st.button("취소", use_container_width=True):
            st.rerun()


# 새로운 환자 정보 입력을 위한 리셋    
def reset_info():
        st.session_state['patient_info'] = None
        # Chatbot history reset
        st.session_state['messages'] = None
        st.session_state['rag_messages'] = None
        # 페이지 3의 정보안내를 위한 설정
        st.session_state['current_step'] = 0
        st.session_state['progress'] = 0
        st.session_state['stay'] = dict()
        st.rerun()

# 환자 정보 등록 과정
def input_patient_info():

    # DB에 저장된 주치의 명을 가져온다.    
    doctors = run_related_query()
    df_docs = pd.DataFrame(doctors.data)
    docs_lst = df_docs['name'].tolist()
    docs_lst.insert(0, '<선택>')

    # 소견 분류 상세 내용
    categories = {1: '전안부', 2:'각막', 3:'전방', 4:'수정체', 5:'망막', 6:'시신경'}
    category_details = {
        '전안부': ["안검염(마이봄샘 기능장애 포함)", "건성안"], 
        '각막': ["내피세포 이상 1200개 미만", "내피세포 이상 1200~1500개", "각막혼탁","기타각막질환"], 
        '전방': ["얕은 전방", "산동 저하", "소대 이상", "급성폐쇄각녹내장", "거짓비늘증후군", "외상"],
        '수정체': ["심한 백내장(백색, 갈색, 후낭하혼탁 포함)", "안저검사 불가"],
        '망막': ["망막질환 (황반변성, 당뇨망막병증 등)"],
        '시신경': ["녹내장", "뇌병변으로 인한 시야장애"]}

    # 환자의 소견 정보 저장
    diagnosis = {}

    with st.container(border=True):
        st.subheader("환자의 소견 정보")
        # 분류 1 : '전안부': ["안검염(마이봄샘 기능장애 포함)", "건성안"]
        with st.container(border=True):
            cat1_title, cat1_cotent = st.columns([1, 5])
            with cat1_title:
                st.write("#### 전안부")
            selelcted_cats = []
            with cat1_cotent:
                cat1_1, cat1_2 = st.columns([2, 1])
                with cat1_1:
                    if st.checkbox("안검염(마이봄샘 기능장애 포함)", key=1_1):
                        selelcted_cats.append("안검염(마이봄샘 기능장애 포함)")
                with cat1_2:
                    if st.checkbox("건성안", key=1_2):
                        selelcted_cats.append("건성안")
            diagnosis["전안부"] = selelcted_cats

        # 분류 2 : '각막': ["내피세포 이상 1200개 미만", "1200~1500개", "각막혼탁","기타각막질환"],
        with st.container(border=True):
            cat2_title, cat2_cotent = st.columns([1, 5])
            with cat2_title:
                st.write("#### 각막")
            selelcted_cats = []
            with cat2_cotent:
                cat2_1, cat2_2 = st.columns([1, 1])
                with cat2_1:
                    if st.checkbox("내피세포 이상 1200개 미만", key=2_1):
                        selelcted_cats.append("내피세포 이상 1200개 미만")
                with cat2_2:
                    if st.checkbox("내피세포 이상 1200~1500개", key=2_2):
                        selelcted_cats.append("내피세포 이상 1200~1500개")
                cat2_1_u, cat2_2_u = st.columns([1, 1])
                with cat2_1_u:
                    if st.checkbox("각막혼탁", key=2_3):
                        selelcted_cats.append("각막혼탁")
                with cat2_2_u:
                    if st.checkbox("기타각막질환", key=2_4):
                        selelcted_cats.append("기타각막질환")
            diagnosis["각막"] = selelcted_cats
        # 분류 3 : '전방': ["얕은 전방", "산동 저하", "소대 이상", "급성폐쇄각녹내장", "거짓비늘증후군", "외상"]
        with st.container(border=True):
            cat3_title, cat3_cotent = st.columns([1, 5])
            with cat3_title:
                st.write("#### 전방")
            selelcted_cats = []
            with cat3_cotent:
                cat3_1, cat3_2, cat3_3 = st.columns([1, 1, 1])
                with cat3_1:
                    if st.checkbox("얕은 전방", key=3_1):
                        selelcted_cats.append("얕은 전방")
                with cat3_2:
                    if st.checkbox("산동 저하", key=3_2):
                        selelcted_cats.append("산동 저하")
                with cat3_3:
                    if st.checkbox("소대 이상", key=3_3):
                        selelcted_cats.append("소대 이상")
                cat3_1_u, cat3_2_u, cat3_3_u = st.columns([1, 1, 1])
                with cat3_1_u:
                    if st.checkbox("급성폐쇄각녹내장", key=3_4):
                        selelcted_cats.append("급성폐쇄각녹내장")
                with cat3_2_u:
                    if st.checkbox("거짓비늘증후군", key=3_5):
                        selelcted_cats.append("거짓비늘증후군")
                with cat3_3_u:
                    if st.checkbox("외상", key=3_6):
                        selelcted_cats.append("외상")
            diagnosis["전방"] = selelcted_cats
        # 분류 4 : '수정체': ["심한 백내장(백색, 갈색, 후낭하혼탁 포함)", "안저검사 불가"]
        with st.container(border=True):
            cat4_title, cat4_cotent = st.columns([1, 5])
            selelcted_cats = []
            with cat4_title:
                st.write("#### 수정체")
            with cat4_cotent:
                cat4_1, cat4_2 = st.columns([2, 1])
                with cat4_1:
                    if st.checkbox("심한 백내장(백색, 갈색, 후낭하혼탁 포함)", key=4_1):
                        selelcted_cats.append("심한 백내장(백색, 갈색, 후낭하혼탁 포함)")
                with cat4_2:
                    if st.checkbox("안저검사 불가", key=4_2):
                        selelcted_cats.append("안저검사 불가")
            diagnosis["수정체"] = selelcted_cats
        # 분류 5 : '망막': ["망막질환 (황반변성, 당뇨망막병증 등)"]
        with st.container(border=True):
            cat5_title, cat5_cotent = st.columns([1, 5])
            with cat5_title:
                st.write("#### 망막")
            selelcted_cats = []
            with cat5_cotent:
                if st.checkbox("망막질환(황반변성, 당뇨망막병증 등)", key=5_1):
                    selelcted_cats.append("망막질환(황반변성, 당뇨망막병증 등)")
            diagnosis["망막"] = selelcted_cats
        # 분류 6 :'시신경': ["녹내장", "뇌병변으로 인한 시야장애"]
        with st.container(border=True):
            cat6_title, cat6_cotent = st.columns([1, 5])
            with cat6_title:
                st.write("#### 시신경")
            selelcted_cats = []
            with cat6_cotent:
                cat6_1, cat6_2 = st.columns([1, 2])
                with cat6_1:
                    if st.checkbox("녹내장", key=6_1):
                        selelcted_cats.append("녹내장")
                with cat6_2:
                    if st.checkbox("뇌병변으로 인한 시야장애", key=6_2):
                        selelcted_cats.append("뇌병변으로 인한 시야장애")
            diagnosis["시신경"] = selelcted_cats

    with st.form("환자 정보 입력"):
        # 1. 환자번호 입력 (7자리 숫자)
        col1_1, col1_2 = st.columns(2)
        with col1_1:
            patient_number = st.text_input("환자번호(7자리)", max_chars=7)

        # 2. 환자 이름 입력
        with col1_2:
            patient_name = st.text_input("환자 이름")

        col2_1, col2_2 = st.columns(2)
        # 3. 성별 선택 (라디오버튼)
        with col2_1:
            gender = st.radio("성별", ("남성", "여성", "기타"), horizontal=True)
        
        with col2_2:
            # 4. 생일 선택
            birth_date = st.date_input("생년월일",
                                    value=datetime(2000, 1, 1),
                                        min_value=datetime(1924, 1, 1),
                                        max_value=datetime.today())
            age = datetime.now().year - birth_date.year - ((datetime.now().month, datetime.now().day) < (birth_date.month, birth_date.day))

        # 5. 주치의 선택
        col3_1, col3_2 = st.columns(2)
        with col3_1:
            primary_doctor = st.selectbox("주치의", docs_lst)

        # 6. 수술 눈 부위 선택 (좌안, 우안, 양안)
        with col3_2:
            surgery_eye = st.radio("수술 부위", ["좌안", "우안", "양안"], horizontal=True)

        # 7. 예정 수술 일자와 시간 선택
        col4_1, col4_2 = st.columns(2)
        with col4_1:
            surgery_date = st.date_input("수술 날짜")
        with col4_2:
            surgery_time = st.time_input("수술 시간", time(7, 00), step=1800)

        # 폼 제출 버튼
        submitted = st.form_submit_button("환자 정보 등록")
        
        # 유효성 검사
        if submitted:
            error_messages = []

            # 환자번호가 7자리 숫자인지 확인
            if not patient_number.isdigit() or len(patient_number) != 7:
                error_messages.append("환자번호는 숫자만 포함되어야 합니다.")

            # 빈 필드가 있는지 확인
            if not patient_name:
                error_messages.append("환자 이름을 입력해주세요.")
            if not gender:
                error_messages.append("성별을 입력해주세요.")
            if not birth_date:
                error_messages.append("생일을 입력해주세요.")
            if not primary_doctor or primary_doctor == "<선택>":
                error_messages.append("주치의를 입력해주세요.")
            if not surgery_eye:
                error_messages.append("수술 부위를 선택해주세요.")
            if not surgery_date:
                error_messages.append("수술 날짜를 선택해주세요.")
            if not surgery_time:
                error_messages.append("수술 시간을 선택해주세요.")

            # 오류 메시지가 있으면 표시
            if error_messages:
                for error in error_messages:
                    st.error(error)
            else:
                # 유효성 검사를 통과한 경우 세션에 정보 저장
                st.session_state['patient_info'] = {
                    'patient_number': patient_number,
                    'patient_name': patient_name,
                    'gender': gender,
                    'birth_date': birth_date,
                    'age': age,
                    'primary_doctor': primary_doctor,
                    'surgery_eye': surgery_eye,
                    'surgery_date': surgery_date,
                    'surgery_time': surgery_time,
                    'diagnosis' : diagnosis
                }
                st.success("환자 정보가 성공적으로 등록되었습니다.")
                st.rerun()

def reset_category_select():
    pass