--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'WIN1252';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: generate_rs_number(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_rs_number() RETURNS text
    LANGUAGE plpgsql
    AS $_$
DECLARE
    current_year INTEGER := EXTRACT(YEAR FROM NOW());
    prefix TEXT := 'RS' || current_year;
    next_number INTEGER;
BEGIN
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(rs_number FROM LENGTH(prefix) + 1) AS INTEGER)
    ), 0) + 1
    INTO next_number
    FROM requisition_forms 
    WHERE rs_number LIKE prefix || '%'
    AND rs_number ~ ('^' || prefix || '\d+$');

    RETURN prefix || LPAD(next_number::TEXT, 4, '0');
END;
$_$;


ALTER FUNCTION public.generate_rs_number() OWNER TO postgres;

--
-- Name: get_workflow_status(timestamp with time zone, timestamp with time zone, timestamp with time zone, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_workflow_status(p_received_by_date timestamp with time zone, p_issued_by_date timestamp with time zone, p_approved_by_date timestamp with time zone, p_checked_by_date timestamp with time zone) RETURNS text
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF p_received_by_date IS NOT NULL THEN
        RETURN 'Completed';
    ELSIF p_issued_by_date IS NOT NULL THEN
        RETURN 'Issued';
    ELSIF p_approved_by_date IS NOT NULL THEN
        RETURN 'Approved';
    ELSIF p_checked_by_date IS NOT NULL THEN
        RETURN 'Checked';
    ELSE
        RETURN 'Pending';
    END IF;
END;
$$;


ALTER FUNCTION public.get_workflow_status(p_received_by_date timestamp with time zone, p_issued_by_date timestamp with time zone, p_approved_by_date timestamp with time zone, p_checked_by_date timestamp with time zone) OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

--
-- Name: validate_workflow_sequence(timestamp with time zone, timestamp with time zone, timestamp with time zone, timestamp with time zone, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.validate_workflow_sequence(p_date_requested timestamp with time zone, p_checked_by_date timestamp with time zone, p_approved_by_date timestamp with time zone, p_issued_by_date timestamp with time zone, p_received_by_date timestamp with time zone) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
    dates TIMESTAMPTZ[] := ARRAY[p_date_requested, p_checked_by_date, p_approved_by_date, p_issued_by_date, p_received_by_date];
    prev_date TIMESTAMPTZ := NULL;
    curr_date TIMESTAMPTZ;
BEGIN
    FOREACH curr_date IN ARRAY dates LOOP
        IF curr_date IS NOT NULL THEN
            IF prev_date IS NOT NULL AND curr_date < prev_date THEN
                RETURN FALSE;
            END IF;
            prev_date := curr_date;
        END IF;
    END LOOP;
    RETURN TRUE;
END;
$$;


ALTER FUNCTION public.validate_workflow_sequence(p_date_requested timestamp with time zone, p_checked_by_date timestamp with time zone, p_approved_by_date timestamp with time zone, p_issued_by_date timestamp with time zone, p_received_by_date timestamp with time zone) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: picto_archive; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.picto_archive (
    archive_id integer NOT NULL,
    item_id integer NOT NULL,
    item_name character varying(255) NOT NULL,
    description text,
    category character varying(100),
    quantity integer,
    unit character varying(50),
    location character varying(100),
    status character varying(50),
    date_added timestamp without time zone,
    serial_number character varying(100),
    archived_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    archived_reason text,
    archived_by character varying(100),
    original_item_id integer,
    stock_threshold integer
);


ALTER TABLE public.picto_archive OWNER TO postgres;

--
-- Name: picto_archive_archive_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.picto_archive_archive_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.picto_archive_archive_id_seq OWNER TO postgres;

--
-- Name: picto_archive_archive_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.picto_archive_archive_id_seq OWNED BY public.picto_archive.archive_id;


--
-- Name: picto_inventory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.picto_inventory (
    item_id integer NOT NULL,
    item_name character varying(100) NOT NULL,
    description text,
    category character varying(50),
    quantity integer DEFAULT 0 NOT NULL,
    unit character varying(20),
    location character varying(100),
    status character varying(20) DEFAULT 'Available'::character varying,
    date_added date DEFAULT CURRENT_DATE,
    serial_number character varying(100),
    stock_threshold integer DEFAULT 10
);


ALTER TABLE public.picto_inventory OWNER TO postgres;

--
-- Name: picto_inventory_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.picto_inventory_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.picto_inventory_item_id_seq OWNER TO postgres;

--
-- Name: picto_inventory_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.picto_inventory_item_id_seq OWNED BY public.picto_inventory.item_id;


--
-- Name: repair_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.repair_log (
    log_id integer NOT NULL,
    status_id integer,
    request_form_id integer,
    item_id integer,
    device_type character varying(50),
    issue_reported text,
    diagnosis text,
    final_status character varying(50),
    assigned_to_name character varying(100),
    assigned_to_position character varying(50),
    date_received timestamp without time zone,
    date_started timestamp without time zone,
    date_completed timestamp without time zone,
    location_from character varying(100),
    location_to character varying(100),
    parts_used text,
    repair_notes text,
    archived_at timestamp without time zone DEFAULT now(),
    archived_by character varying(100)
);


ALTER TABLE public.repair_log OWNER TO postgres;

--
-- Name: repair_log_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.repair_log_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.repair_log_log_id_seq OWNER TO postgres;

--
-- Name: repair_log_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.repair_log_log_id_seq OWNED BY public.repair_log.log_id;


--
-- Name: repair_status; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.repair_status (
    status_id integer NOT NULL,
    request_form_id integer,
    item_id integer,
    device_type character varying(50),
    issue_reported text,
    current_status character varying(50),
    assigned_to_name character varying(100),
    assigned_to_position character varying(50),
    date_received timestamp without time zone,
    date_started timestamp without time zone,
    location_from character varying(100),
    location_to character varying(100),
    notes text
);


ALTER TABLE public.repair_status OWNER TO postgres;

--
-- Name: repair_status_status_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.repair_status_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.repair_status_status_id_seq OWNER TO postgres;

--
-- Name: repair_status_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.repair_status_status_id_seq OWNED BY public.repair_status.status_id;


--
-- Name: request_archive; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.request_archive (
    req_id integer NOT NULL,
    requestor_name character varying(255) NOT NULL,
    requestor_position character varying(255),
    department character varying(255),
    issue_description text,
    date_requested timestamp without time zone NOT NULL,
    checked_by_name character varying(255),
    checked_by_position character varying(255),
    checked_by_date timestamp without time zone,
    approved_by_name character varying(255),
    approved_by_position character varying(255),
    approved_by_date timestamp without time zone,
    issued_by_name character varying(255),
    issued_by_position character varying(255),
    issued_by_date timestamp without time zone,
    received_by_name character varying(255),
    received_by_position character varying(255),
    received_by_date timestamp without time zone,
    is_archived boolean DEFAULT false
);


ALTER TABLE public.request_archive OWNER TO postgres;

--
-- Name: request_forms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.request_forms (
    req_id integer NOT NULL,
    requestor_name character varying(100) NOT NULL,
    requestor_position character varying(100),
    department character varying(100),
    issue_description text,
    date_requested timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    checked_by_name character varying(100),
    checked_by_position character varying(100),
    checked_by_date timestamp without time zone,
    approved_by_name character varying(100),
    approved_by_position character varying(100),
    approved_by_date timestamp without time zone,
    issued_by_name character varying(100),
    issued_by_position character varying(100),
    issued_by_date timestamp without time zone,
    received_by_name character varying(100),
    received_by_position character varying(100),
    received_by_date timestamp without time zone
);


ALTER TABLE public.request_forms OWNER TO postgres;

--
-- Name: request_forms_archive_req_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.request_forms_archive_req_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.request_forms_archive_req_id_seq OWNER TO postgres;

--
-- Name: request_forms_archive_req_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.request_forms_archive_req_id_seq OWNED BY public.request_archive.req_id;


--
-- Name: request_forms_req_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.request_forms_req_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.request_forms_req_id_seq OWNER TO postgres;

--
-- Name: request_forms_req_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.request_forms_req_id_seq OWNED BY public.request_forms.req_id;


--
-- Name: requisition_archive; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.requisition_archive (
    archive_id character varying(50) NOT NULL,
    rf_id character varying(50) NOT NULL,
    rs_number character varying(100),
    rf_number character varying(100),
    requester_name character varying(100),
    requester_position character varying(100),
    department character varying(100),
    purpose character varying(500),
    date_requested timestamp with time zone,
    checked_by_name character varying(100),
    checked_by_position character varying(100),
    checked_by_date timestamp with time zone,
    approved_by_name character varying(100),
    approved_by_position character varying(100),
    approved_by_date timestamp with time zone,
    issued_by_name character varying(100),
    issued_by_position character varying(100),
    issued_by_date timestamp with time zone,
    received_by_name character varying(100),
    received_by_position character varying(100),
    received_by_date timestamp with time zone,
    is_archived boolean DEFAULT true NOT NULL,
    archived_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_reason character varying(255),
    archived_by character varying(100),
    archive_metadata character varying(1000),
    system_version character varying(50),
    archived_from_ip character varying(45),
    user_agent character varying(500),
    is_restorable boolean DEFAULT true NOT NULL,
    retention_expires_at timestamp with time zone
);


ALTER TABLE public.requisition_archive OWNER TO postgres;

--
-- Name: requisition_forms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.requisition_forms (
    rf_id character varying(50) NOT NULL,
    rs_number character varying(100),
    rf_number character varying(100),
    requester_name character varying(100) NOT NULL,
    requester_position character varying(100) NOT NULL,
    department character varying(100) NOT NULL,
    purpose character varying(500) NOT NULL,
    date_requested timestamp with time zone,
    checked_by_name character varying(100),
    checked_by_position character varying(100),
    checked_by_date timestamp with time zone,
    approved_by_name character varying(100),
    approved_by_position character varying(100),
    approved_by_date timestamp with time zone,
    issued_by_name character varying(100),
    issued_by_position character varying(100),
    issued_by_date timestamp with time zone,
    received_by_name character varying(100),
    received_by_position character varying(100),
    received_by_date timestamp with time zone,
    is_archived boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT chk_approved_by_consistency CHECK ((((approved_by_date IS NULL) AND (approved_by_name IS NULL) AND (approved_by_position IS NULL)) OR ((approved_by_date IS NOT NULL) AND (approved_by_name IS NOT NULL) AND (approved_by_position IS NOT NULL)))),
    CONSTRAINT chk_checked_by_consistency CHECK ((((checked_by_date IS NULL) AND (checked_by_name IS NULL) AND (checked_by_position IS NULL)) OR ((checked_by_date IS NOT NULL) AND (checked_by_name IS NOT NULL) AND (checked_by_position IS NOT NULL)))),
    CONSTRAINT chk_department_length CHECK (((length((department)::text) >= 2) AND (length((department)::text) <= 100))),
    CONSTRAINT chk_issued_by_consistency CHECK ((((issued_by_date IS NULL) AND (issued_by_name IS NULL) AND (issued_by_position IS NULL)) OR ((issued_by_date IS NOT NULL) AND (issued_by_name IS NOT NULL) AND (issued_by_position IS NOT NULL)))),
    CONSTRAINT chk_purpose_length CHECK (((length((purpose)::text) >= 10) AND (length((purpose)::text) <= 500))),
    CONSTRAINT chk_received_by_consistency CHECK ((((received_by_date IS NULL) AND (received_by_name IS NULL) AND (received_by_position IS NULL)) OR ((received_by_date IS NOT NULL) AND (received_by_name IS NOT NULL) AND (received_by_position IS NOT NULL)))),
    CONSTRAINT chk_requester_name_length CHECK (((length((requester_name)::text) >= 2) AND (length((requester_name)::text) <= 100))),
    CONSTRAINT chk_requester_position_length CHECK (((length((requester_position)::text) >= 2) AND (length((requester_position)::text) <= 100))),
    CONSTRAINT chk_workflow_dates CHECK ((((checked_by_date IS NULL) OR (date_requested IS NULL) OR (checked_by_date >= date_requested)) AND ((approved_by_date IS NULL) OR (checked_by_date IS NULL) OR (approved_by_date >= checked_by_date)) AND ((issued_by_date IS NULL) OR (approved_by_date IS NULL) OR (issued_by_date >= approved_by_date)) AND ((received_by_date IS NULL) OR (issued_by_date IS NULL) OR (received_by_date >= issued_by_date))))
);


ALTER TABLE public.requisition_forms OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    username character varying(50) NOT NULL,
    password_hash text NOT NULL,
    full_name character varying(100) NOT NULL,
    role character varying(50) NOT NULL,
    email character varying(100),
    phone character varying(20),
    date_created timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY (ARRAY[('Admin'::character varying)::text, ('Manager'::character varying)::text, ('User'::character varying)::text])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: v_active_requisitions; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_active_requisitions AS
 SELECT rf_id,
    rs_number,
    rf_number,
    requester_name,
    requester_position,
    department,
    purpose,
    date_requested,
    checked_by_name,
    checked_by_position,
    checked_by_date,
    approved_by_name,
    approved_by_position,
    approved_by_date,
    issued_by_name,
    issued_by_position,
    issued_by_date,
    received_by_name,
    received_by_position,
    received_by_date,
    is_archived,
    created_at,
    updated_at,
    public.get_workflow_status(received_by_date, issued_by_date, approved_by_date, checked_by_date) AS workflow_status,
        CASE
            WHEN (received_by_date IS NOT NULL) THEN (received_by_date - date_requested)
            ELSE (now() - date_requested)
        END AS processing_duration
   FROM public.requisition_forms rf
  WHERE (is_archived = false);


ALTER VIEW public.v_active_requisitions OWNER TO postgres;

--
-- Name: v_archived_requisitions; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_archived_requisitions AS
 SELECT archive_id,
    rf_id,
    rs_number,
    rf_number,
    requester_name,
    requester_position,
    department,
    purpose,
    date_requested,
    checked_by_name,
    checked_by_position,
    checked_by_date,
    approved_by_name,
    approved_by_position,
    approved_by_date,
    issued_by_name,
    issued_by_position,
    issued_by_date,
    received_by_name,
    received_by_position,
    received_by_date,
    is_archived,
    archived_at,
    archived_reason,
    archived_by,
    archive_metadata,
    system_version,
    archived_from_ip,
    user_agent,
    is_restorable,
    retention_expires_at,
    public.get_workflow_status(received_by_date, issued_by_date, approved_by_date, checked_by_date) AS final_workflow_status,
        CASE
            WHEN (date_requested IS NOT NULL) THEN (archived_at - date_requested)
            ELSE NULL::interval
        END AS active_duration,
        CASE
            WHEN (retention_expires_at IS NOT NULL) THEN (retention_expires_at < now())
            ELSE false
        END AS is_expired
   FROM public.requisition_archive ra;


ALTER VIEW public.v_archived_requisitions OWNER TO postgres;

--
-- Name: v_workflow_statistics; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_workflow_statistics AS
 SELECT 'Active'::text AS record_type,
    count(*) AS total_count,
    count(*) FILTER (WHERE (public.get_workflow_status(requisition_forms.received_by_date, requisition_forms.issued_by_date, requisition_forms.approved_by_date, requisition_forms.checked_by_date) = 'Pending'::text)) AS pending_count,
    count(*) FILTER (WHERE (public.get_workflow_status(requisition_forms.received_by_date, requisition_forms.issued_by_date, requisition_forms.approved_by_date, requisition_forms.checked_by_date) = 'Checked'::text)) AS checked_count,
    count(*) FILTER (WHERE (public.get_workflow_status(requisition_forms.received_by_date, requisition_forms.issued_by_date, requisition_forms.approved_by_date, requisition_forms.checked_by_date) = 'Approved'::text)) AS approved_count,
    count(*) FILTER (WHERE (public.get_workflow_status(requisition_forms.received_by_date, requisition_forms.issued_by_date, requisition_forms.approved_by_date, requisition_forms.checked_by_date) = 'Issued'::text)) AS issued_count,
    count(*) FILTER (WHERE (public.get_workflow_status(requisition_forms.received_by_date, requisition_forms.issued_by_date, requisition_forms.approved_by_date, requisition_forms.checked_by_date) = 'Completed'::text)) AS completed_count
   FROM public.requisition_forms
  WHERE (requisition_forms.is_archived = false)
UNION ALL
 SELECT 'Archived'::text AS record_type,
    count(*) AS total_count,
    count(*) FILTER (WHERE (public.get_workflow_status(requisition_archive.received_by_date, requisition_archive.issued_by_date, requisition_archive.approved_by_date, requisition_archive.checked_by_date) = 'Pending'::text)) AS pending_count,
    count(*) FILTER (WHERE (public.get_workflow_status(requisition_archive.received_by_date, requisition_archive.issued_by_date, requisition_archive.approved_by_date, requisition_archive.checked_by_date) = 'Checked'::text)) AS checked_count,
    count(*) FILTER (WHERE (public.get_workflow_status(requisition_archive.received_by_date, requisition_archive.issued_by_date, requisition_archive.approved_by_date, requisition_archive.checked_by_date) = 'Approved'::text)) AS approved_count,
    count(*) FILTER (WHERE (public.get_workflow_status(requisition_archive.received_by_date, requisition_archive.issued_by_date, requisition_archive.approved_by_date, requisition_archive.checked_by_date) = 'Issued'::text)) AS issued_count,
    count(*) FILTER (WHERE (public.get_workflow_status(requisition_archive.received_by_date, requisition_archive.issued_by_date, requisition_archive.approved_by_date, requisition_archive.checked_by_date) = 'Completed'::text)) AS completed_count
   FROM public.requisition_archive;


ALTER VIEW public.v_workflow_statistics OWNER TO postgres;

--
-- Name: picto_archive archive_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.picto_archive ALTER COLUMN archive_id SET DEFAULT nextval('public.picto_archive_archive_id_seq'::regclass);


--
-- Name: picto_inventory item_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.picto_inventory ALTER COLUMN item_id SET DEFAULT nextval('public.picto_inventory_item_id_seq'::regclass);


--
-- Name: repair_log log_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_log ALTER COLUMN log_id SET DEFAULT nextval('public.repair_log_log_id_seq'::regclass);


--
-- Name: repair_status status_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_status ALTER COLUMN status_id SET DEFAULT nextval('public.repair_status_status_id_seq'::regclass);


--
-- Name: request_archive req_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_archive ALTER COLUMN req_id SET DEFAULT nextval('public.request_forms_archive_req_id_seq'::regclass);


--
-- Name: request_forms req_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_forms ALTER COLUMN req_id SET DEFAULT nextval('public.request_forms_req_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Data for Name: picto_archive; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.picto_archive (archive_id, item_id, item_name, description, category, quantity, unit, location, status, date_added, serial_number, archived_at, archived_reason, archived_by, original_item_id, stock_threshold) FROM stdin;
12	5	qeqwe	eqwqwe		2	pcs	dasdasd	Available	2025-08-24 00:00:00	eqweq	2025-08-24 03:00:58.984712	Deleted by admin	System	5	10
\.


--
-- Data for Name: picto_inventory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.picto_inventory (item_id, item_name, description, category, quantity, unit, location, status, date_added, serial_number, stock_threshold) FROM stdin;
6	dasdas	dasdasd	IT Supplies	100	kg	dasda	Available	2025-08-24	dasda	25
4	asdadasa	asdasd	Electronics	5	kgs	dasdas	Available	2025-08-24	dasda	10
\.


--
-- Data for Name: repair_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.repair_log (log_id, status_id, request_form_id, item_id, device_type, issue_reported, diagnosis, final_status, assigned_to_name, assigned_to_position, date_received, date_started, date_completed, location_from, location_to, parts_used, repair_notes, archived_at, archived_by) FROM stdin;
\.


--
-- Data for Name: repair_status; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.repair_status (status_id, request_form_id, item_id, device_type, issue_reported, current_status, assigned_to_name, assigned_to_position, date_received, date_started, location_from, location_to, notes) FROM stdin;
\.


--
-- Data for Name: request_archive; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.request_archive (req_id, requestor_name, requestor_position, department, issue_description, date_requested, checked_by_name, checked_by_position, checked_by_date, approved_by_name, approved_by_position, approved_by_date, issued_by_name, issued_by_position, issued_by_date, received_by_name, received_by_position, received_by_date, is_archived) FROM stdin;
\.


--
-- Data for Name: request_forms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.request_forms (req_id, requestor_name, requestor_position, department, issue_description, date_requested, checked_by_name, checked_by_position, checked_by_date, approved_by_name, approved_by_position, approved_by_date, issued_by_name, issued_by_position, issued_by_date, received_by_name, received_by_position, received_by_date) FROM stdin;
1	Sample Requestor	\N	\N	\N	2025-08-11 19:13:11.619606	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
2	Sample Requestor	\N	\N	\N	2025-08-11 19:14:43.976694	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: requisition_archive; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.requisition_archive (archive_id, rf_id, rs_number, rf_number, requester_name, requester_position, department, purpose, date_requested, checked_by_name, checked_by_position, checked_by_date, approved_by_name, approved_by_position, approved_by_date, issued_by_name, issued_by_position, issued_by_date, received_by_name, received_by_position, received_by_date, is_archived, archived_at, archived_reason, archived_by, archive_metadata, system_version, archived_from_ip, user_agent, is_restorable, retention_expires_at) FROM stdin;
7bbd36bf-e764-4c91-834a-8df5667d6127	a76c32b3-ea66-46f3-997d-d19111b0ac7a	RS20250002	\N	sir ace	admin tech	picto	fix power supply issues	2025-08-23 21:38:49.555071+08	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	2025-08-23 21:47:58.749965+08	Archived via Angular	system	\N	\N	\N	\N	t	2032-08-23 21:47:58.752311+08
51ef0886-d3a6-42fa-9948-3747a680f29e	1632b4ec-356d-4703-97b7-e59515a2b01c	RS20250001	\N	chuckz	admin aide	picto	fix cpu issues	2025-08-23 08:00:00+08	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	2025-08-23 21:54:53.109354+08	string	string	string	\N	\N	\N	t	2032-08-23 21:54:53.109357+08
105b89e9-56df-476f-8440-b78121bcf7fe	ce42ab62-51d9-45ac-ab61-245beaabe13a	RS-5002	43-5762	sir ace	admin aide III	picto	fix psu not working properly	2025-08-24 08:00:00+08	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	2025-08-24 11:00:14.907074+08	Archived by admin	admin	\N	\N	\N	\N	t	2032-08-24 11:00:14.908946+08
\.


--
-- Data for Name: requisition_forms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.requisition_forms (rf_id, rs_number, rf_number, requester_name, requester_position, department, purpose, date_requested, checked_by_name, checked_by_position, checked_by_date, approved_by_name, approved_by_position, approved_by_date, issued_by_name, issued_by_position, issued_by_date, received_by_name, received_by_position, received_by_date, is_archived, created_at, updated_at) FROM stdin;
e6340e82-09f2-4434-a633-c3bbd9698005	RS20250001	\N	chuckz	admin aide	picto	fix overheating cpu issues	2025-08-24 08:00:00+08	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2025-08-24 10:56:52.799951+08	2025-08-24 11:02:25.510792+08
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, username, password_hash, full_name, role, email, phone, date_created) FROM stdin;
3	admin	$2a$12$T7Yud3/PRxF0L.zMrih3IeauhTwzWCiQ7gmvj1aDvI0ER2Ww7LCda	Admin	Admin	admin@root.com	1234567890	2025-08-12 01:15:41.579701
21	dummy	$2a$12$tJSPNpkbpyt0nzBuRfLIFe3h5ATi6PyBOUzwFhxUr1/84PWzgevmC	usertest	User	usertest@mail.com	123456742342	2025-08-21 17:50:58.572263
20	chuckz	$2a$12$6QM/V4FprY/ysxPbLwY9WOXt9pzXENR22j1IoGkphG3du56ay1Q7u	Chuckie	Manager	chuckz.espanola@gmail.com	3453453	2025-08-21 17:40:16.286907
\.


--
-- Name: picto_archive_archive_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.picto_archive_archive_id_seq', 12, true);


--
-- Name: picto_inventory_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.picto_inventory_item_id_seq', 6, true);


--
-- Name: repair_log_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.repair_log_log_id_seq', 1, false);


--
-- Name: repair_status_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.repair_status_status_id_seq', 1, false);


--
-- Name: request_forms_archive_req_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.request_forms_archive_req_id_seq', 1, false);


--
-- Name: request_forms_req_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.request_forms_req_id_seq', 2, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 21, true);


--
-- Name: picto_archive picto_archive_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.picto_archive
    ADD CONSTRAINT picto_archive_pkey PRIMARY KEY (archive_id);


--
-- Name: picto_inventory picto_inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.picto_inventory
    ADD CONSTRAINT picto_inventory_pkey PRIMARY KEY (item_id);


--
-- Name: repair_log repair_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_log
    ADD CONSTRAINT repair_log_pkey PRIMARY KEY (log_id);


--
-- Name: repair_status repair_status_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_status
    ADD CONSTRAINT repair_status_pkey PRIMARY KEY (status_id);


--
-- Name: request_archive request_forms_archive_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_archive
    ADD CONSTRAINT request_forms_archive_pkey PRIMARY KEY (req_id);


--
-- Name: request_forms request_forms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_forms
    ADD CONSTRAINT request_forms_pkey PRIMARY KEY (req_id);


--
-- Name: requisition_archive requisition_archive_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requisition_archive
    ADD CONSTRAINT requisition_archive_pkey PRIMARY KEY (archive_id);


--
-- Name: requisition_forms requisition_forms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requisition_forms
    ADD CONSTRAINT requisition_forms_pkey PRIMARY KEY (rf_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_requisition_archive_archived_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requisition_archive_archived_at ON public.requisition_archive USING btree (archived_at);


--
-- Name: idx_requisition_archive_archived_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requisition_archive_archived_by ON public.requisition_archive USING btree (archived_by);


--
-- Name: idx_requisition_archive_date_requested; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requisition_archive_date_requested ON public.requisition_archive USING btree (date_requested);


--
-- Name: idx_requisition_archive_department; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requisition_archive_department ON public.requisition_archive USING btree (department);


--
-- Name: idx_requisition_archive_is_restorable; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requisition_archive_is_restorable ON public.requisition_archive USING btree (is_restorable);


--
-- Name: idx_requisition_archive_retention_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requisition_archive_retention_expires ON public.requisition_archive USING btree (retention_expires_at) WHERE (retention_expires_at IS NOT NULL);


--
-- Name: idx_requisition_archive_rf_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requisition_archive_rf_id ON public.requisition_archive USING btree (rf_id);


--
-- Name: idx_requisition_archive_rf_id_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_requisition_archive_rf_id_unique ON public.requisition_archive USING btree (rf_id);


--
-- Name: idx_requisition_archive_search; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requisition_archive_search ON public.requisition_archive USING btree (archived_at, department, archived_by);


--
-- Name: idx_requisition_archive_text_search; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requisition_archive_text_search ON public.requisition_archive USING gin (to_tsvector('english'::regconfig, (((COALESCE(requester_name, ''::character varying))::text || ' '::text) || (COALESCE(purpose, ''::character varying))::text)));


--
-- Name: idx_requisition_forms_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requisition_forms_created_at ON public.requisition_forms USING btree (created_at);


--
-- Name: idx_requisition_forms_date_requested; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requisition_forms_date_requested ON public.requisition_forms USING btree (date_requested) WHERE (date_requested IS NOT NULL);


--
-- Name: idx_requisition_forms_department; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requisition_forms_department ON public.requisition_forms USING btree (department);


--
-- Name: idx_requisition_forms_is_archived; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requisition_forms_is_archived ON public.requisition_forms USING btree (is_archived);


--
-- Name: idx_requisition_forms_requester_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requisition_forms_requester_name ON public.requisition_forms USING btree (requester_name);


--
-- Name: idx_requisition_forms_rf_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requisition_forms_rf_number ON public.requisition_forms USING btree (rf_number) WHERE (rf_number IS NOT NULL);


--
-- Name: idx_requisition_forms_rs_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requisition_forms_rs_number ON public.requisition_forms USING btree (rs_number) WHERE (rs_number IS NOT NULL);


--
-- Name: idx_requisition_forms_search; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requisition_forms_search ON public.requisition_forms USING btree (department, is_archived, date_requested) WHERE (is_archived = false);


--
-- Name: idx_requisition_forms_workflow_dates; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requisition_forms_workflow_dates ON public.requisition_forms USING btree (date_requested, checked_by_date, approved_by_date, issued_by_date, received_by_date) WHERE (is_archived = false);


--
-- Name: requisition_forms trigger_requisition_forms_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_requisition_forms_updated_at BEFORE UPDATE ON public.requisition_forms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: repair_status repair_status_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_status
    ADD CONSTRAINT repair_status_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.picto_inventory(item_id);


--
-- Name: repair_status repair_status_request_form_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_status
    ADD CONSTRAINT repair_status_request_form_id_fkey FOREIGN KEY (request_form_id) REFERENCES public.request_forms(req_id);


--
-- PostgreSQL database dump complete
--

