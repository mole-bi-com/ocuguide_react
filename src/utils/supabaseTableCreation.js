// Supabase SQL 함수 정의

// 테이블 목록 조회 함수
export const LIST_TABLES_SQL = `
CREATE OR REPLACE FUNCTION list_tables()
RETURNS SETOF text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT tablename::text
  FROM pg_catalog.pg_tables
  WHERE schemaname = 'public';
END;
$$;
`;

// 환자 테이블 생성 함수
export const CREATE_PATIENTS_TABLE_SQL = `
CREATE OR REPLACE FUNCTION create_patients_table()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_number TEXT UNIQUE NOT NULL,
    patient_name TEXT NOT NULL,
    gender TEXT,
    birth_date TEXT,
    age INTEGER,
    primary_doctor TEXT,
    surgery_eye TEXT,
    surgery_date TEXT,
    surgery_time TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    emergency_contact TEXT,
    emergency_phone TEXT,
    medical_history TEXT,
    allergies TEXT,
    medications TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  );
  
  -- UUID 확장 기능 활성화
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  
  -- RLS 정책 설정
  ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
  
  -- 모든 사용자가 읽기 가능하도록 설정
  CREATE POLICY "Enable read access for all users" ON public.patients
    FOR SELECT
    TO authenticated
    USING (true);
    
  -- 인증된 사용자만 추가/수정 가능하도록 설정
  CREATE POLICY "Enable insert for authenticated users only" ON public.patients
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
    
  CREATE POLICY "Enable update for authenticated users only" ON public.patients
    FOR UPDATE
    TO authenticated
    USING (true);

  -- 익명 사용자도 접근할 수 있는 정책 추가
  CREATE POLICY "Enable access for anon users" ON public.patients
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;
`;

// 세션 테이블 생성 함수
export const CREATE_SESSIONS_TABLE_SQL = `
CREATE OR REPLACE FUNCTION create_sessions_table()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_number TEXT REFERENCES public.patients(patient_number),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
    end_time TIMESTAMP WITH TIME ZONE,
    is_completed BOOLEAN DEFAULT false
  );
  
  -- UUID 확장 기능 활성화
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  
  -- RLS 정책 설정
  ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
  
  -- 모든 사용자가 읽기 가능하도록 설정
  CREATE POLICY "Enable read access for all users" ON public.sessions
    FOR SELECT
    TO authenticated
    USING (true);
    
  -- 인증된 사용자만 추가/수정 가능하도록 설정
  CREATE POLICY "Enable insert for authenticated users only" ON public.sessions
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
    
  CREATE POLICY "Enable update for authenticated users only" ON public.sessions
    FOR UPDATE
    TO authenticated
    USING (true);

  -- 익명 사용자도 접근할 수 있는 정책 추가
  CREATE POLICY "Enable access for anon users" ON public.sessions
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;
`;

// 단계 테이블 생성 함수
export const CREATE_STEPS_TABLE_SQL = `
CREATE OR REPLACE FUNCTION create_steps_table()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.sessions(id),
    step_id INTEGER NOT NULL,
    step_name TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_seconds INTEGER NOT NULL
  );
  
  -- UUID 확장 기능 활성화
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  
  -- RLS 정책 설정
  ALTER TABLE public.steps ENABLE ROW LEVEL SECURITY;
  
  -- 모든 사용자가 읽기 가능하도록 설정
  CREATE POLICY "Enable read access for all users" ON public.steps
    FOR SELECT
    TO authenticated
    USING (true);
    
  -- 인증된 사용자만 추가/수정 가능하도록 설정
  CREATE POLICY "Enable insert for authenticated users only" ON public.steps
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
    
  CREATE POLICY "Enable update for authenticated users only" ON public.steps
    FOR UPDATE
    TO authenticated
    USING (true);

  -- 익명 사용자도 접근할 수 있는 정책 추가
  CREATE POLICY "Enable access for anon users" ON public.steps
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;
`;

// 의사 테이블 생성 함수
export const CREATE_DOCTORS_TABLE_SQL = `
CREATE OR REPLACE FUNCTION create_doctors_table()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    specialty TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  );
  
  -- UUID 확장 기능 활성화
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  
  -- RLS 정책 설정
  ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
  
  -- 모든 사용자가 읽기 가능하도록 설정
  CREATE POLICY "Enable read access for all users" ON public.doctors
    FOR SELECT
    TO authenticated
    USING (true);
    
  -- 인증된 사용자만 추가 가능하도록 설정
  CREATE POLICY "Enable insert for authenticated users only" ON public.doctors
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
  
  -- 샘플 의사 데이터 추가
  INSERT INTO public.doctors (name, specialty)
  VALUES
    ('김안과', '백내장 전문의'),
    ('이안과', '녹내장 전문의'),
    ('박안과', '망막 전문의'),
    ('정안과', '각막 전문의')
  ON CONFLICT DO NOTHING;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;
`;

// 모든 SQL 함수들을 배열로 관리
export const ALL_SQL_FUNCTIONS = [
  { name: 'list_tables', sql: LIST_TABLES_SQL },
  { name: 'create_patients_table', sql: CREATE_PATIENTS_TABLE_SQL },
  { name: 'create_sessions_table', sql: CREATE_SESSIONS_TABLE_SQL },
  { name: 'create_steps_table', sql: CREATE_STEPS_TABLE_SQL },
  { name: 'create_doctors_table', sql: CREATE_DOCTORS_TABLE_SQL },
]; 