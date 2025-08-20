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
    original_item_id integer
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
    serial_number character varying(100)
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
    rf_id integer NOT NULL,
    requester_name character varying(100),
    requester_position character varying(100),
    department character varying(100),
    purpose text,
    date_requested timestamp without time zone,
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
    received_by_date timestamp without time zone,
    is_archived boolean,
    archived_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    archived_reason text,
    archived_by character varying(100)
);


ALTER TABLE public.requisition_archive OWNER TO postgres;

--
-- Name: requisition_forms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.requisition_forms (
    rf_id integer NOT NULL,
    requester_name character varying(100) NOT NULL,
    requester_position character varying(100),
    department character varying(100),
    purpose text,
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
    received_by_date timestamp without time zone,
    is_archived boolean DEFAULT false NOT NULL
);


ALTER TABLE public.requisition_forms OWNER TO postgres;

--
-- Name: requisition_forms_rf_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.requisition_forms_rf_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.requisition_forms_rf_id_seq OWNER TO postgres;

--
-- Name: requisition_forms_rf_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.requisition_forms_rf_id_seq OWNED BY public.requisition_forms.rf_id;


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
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['Admin'::character varying, 'Manager'::character varying, 'User'::character varying])::text[])))
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
-- Name: requisition_forms rf_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requisition_forms ALTER COLUMN rf_id SET DEFAULT nextval('public.requisition_forms_rf_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Data for Name: picto_archive; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.picto_archive (archive_id, item_id, item_name, description, category, quantity, unit, location, status, date_added, serial_number, archived_at, archived_reason, archived_by, original_item_id) FROM stdin;
1	16	Laptop	LENOVO THINKPAD T14	Electronics	10	pcs	IT Office	Available	2025-08-12 00:00:00	\N	2025-08-18 14:04:09.045104	COMPLETED	TINTIN	16
3	101	Ergonomic Office Chair	Comfortable office chair with adjustable height and lumbar support	Office Furniture	15	pcs	Main Office	Available	2025-08-12 00:00:00	\N	2025-08-19 11:52:31.797439	Soft delete	System	101
4	10	Laptop	HP OMEN 17 TRANSCEND	Electronics	10	\N	\N	Available	2025-08-12 00:00:00	\N	2025-08-19 11:53:05.676358	Soft delete	System	10
5	14	Laptop	HP OMEN 17 TRANSCEND	Electronics	10	pcs	IT Office	Available	2025-08-12 00:00:00	\N	2025-08-19 11:53:09.227896	Soft delete	System	14
6	15	Laptop	HP OMEN 17 TRANSCEND	Electronics	10	pcs	IT Office	Available	2025-08-12 00:00:00	\N	2025-08-19 11:53:12.086302	Soft delete	System	15
7	17	Laptop	HP OMEN 17 TRANSCEND	Electronics	10	pcs	IT Office	Available	2025-08-12 00:00:00	\N	2025-08-19 11:53:14.785938	Soft delete	System	17
8	2	Laptop Updated	HP OMEN 17 TRANSCEND Updated	Electronics	15	pcs	IT Office	Available	2025-08-12 00:00:00	\N	2025-08-19 12:08:31.820419	Bulk soft delete	System	2
9	4	Office Desk	Wooden office desk	Office Furniture	10	pcs	Main Office	Available	2025-08-13 00:00:00	\N	2025-08-19 12:09:24.790658	Bulk soft delete	System	4
10	5	Projector	HD projector for meetings	IT Equipment	5	pcs	Conference Room	Available	2025-08-13 00:00:00	\N	2025-08-19 12:09:24.791743	Bulk soft delete	System	5
11	6	Wireless Mouse	Ergonomic wireless mouse	IT Equipment	25	pcs	IT Office	Available	2025-08-12 00:00:00	\N	2025-08-19 12:09:24.791817	Bulk soft delete	System	6
12	11	Ergonomic Office Chair	Comfortable office chair	Office Furniture	15	pcs	Main Office	Available	2025-08-12 00:00:00	\N	2025-08-19 12:09:30.180411	Bulk soft delete	System	11
13	7	Wireless Mouse	Ergonomic wireless mouse	IT Equipment	25	pcs	IT Office	Available	2025-08-12 00:00:00	\N	2025-08-19 12:09:30.181062	Bulk soft delete	System	7
14	8	Wireless Mouse	Ergonomic wireless mouse	IT Equipment	25	pcs	IT Office	Available	2025-08-11 00:00:00	\N	2025-08-19 12:09:30.181289	Bulk soft delete	System	8
15	9	Laptop	\N	Electronics	5	\N	\N	Available	2025-08-12 00:00:00	\N	2025-08-19 12:09:30.181444	Bulk soft delete	System	9
16	21	WORKSTATION	HP Z5	Electronics	1	pcs	IT Office	Available	2025-08-11 00:00:00	\N	2025-08-19 12:09:30.181606	Bulk soft delete	System	21
17	24	Laptop	LENOVO THINKPAD T14	Electronics	10	pcs	IT Office	Available	2025-08-12 00:00:00	\N	2025-08-19 12:09:30.181764	Bulk soft delete	System	24
18	29	aaaaa	fsdfsdf	dsfsdf	6	fsdfsd	fsdfsd	Available	2025-08-19 00:00:00	fsdfsdf	2025-08-19 12:41:53.273662	Bulk soft delete	System	29
19	28	aaaaa	sdfsdfs	dsfsdf	1	sdfsdf	sfdsdf	Available	2025-08-19 00:00:00	aaaaa	2025-08-19 12:41:53.27487	Bulk soft delete	System	28
\.


--
-- Data for Name: picto_inventory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.picto_inventory (item_id, item_name, description, category, quantity, unit, location, status, date_added, serial_number) FROM stdin;
26	HP Omen 17 Transcend	gaming laptop	IT Supplies	1	pcs	PICTO Storage Room	Available	2025-08-19	OMN-TS-RND1
27	HP Z5	desktop workstation	Electronics	1	pcs	PICTO Storage Room	Available	2025-08-19	HPZ5-RND2
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

COPY public.requisition_archive (rf_id, requester_name, requester_position, department, purpose, date_requested, checked_by_name, checked_by_position, checked_by_date, approved_by_name, approved_by_position, approved_by_date, issued_by_name, issued_by_position, issued_by_date, received_by_name, received_by_position, received_by_date, is_archived, archived_at, archived_reason, archived_by) FROM stdin;
2	Chuckz	CEO	IT	Purchase new laptops	2025-08-14 05:43:21.529	Jane Checker	IT Supervisor	2025-08-14 06:00:00	Alex Approver	CIO	2025-08-14 06:30:00	Sam Issuer	Inventory Officer	2025-08-14 07:00:00	John Receiver	IT Staff	2025-08-14 07:30:00	t	2025-08-18 21:35:16.983658	string	string
\.


--
-- Data for Name: requisition_forms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.requisition_forms (rf_id, requester_name, requester_position, department, purpose, date_requested, checked_by_name, checked_by_position, checked_by_date, approved_by_name, approved_by_position, approved_by_date, issued_by_name, issued_by_position, issued_by_date, received_by_name, received_by_position, received_by_date, is_archived) FROM stdin;
6	Alice Santos	Staff	IT	Purchase of monitors	2025-08-09 00:00:00	John Reyes	Supervisor	2025-08-10 00:00:00	Maria Cruz	Manager	2025-08-11 00:00:00	Paul Tan	Warehouse	2025-08-12 00:00:00	Luis Gomez	Staff	2025-08-13 00:00:00	f
7	Benito Lim	Engineer	Maintenance	Replacement of tools	2025-08-04 00:00:00	Rosa Dela Cruz	Supervisor	2025-08-05 00:00:00	Victor Ong	Manager	2025-08-06 00:00:00	Carla Reyes	Warehouse	2025-08-07 00:00:00	Ramon Santos	Engineer	2025-08-08 00:00:00	f
8	Carla Diaz	Coordinator	HR	Office supplies	2025-08-12 00:00:00	Henry Lopez	Supervisor	2025-08-13 00:00:00	Angela Tan	Manager	2025-08-14 00:00:00	Monica Cruz	Warehouse	2025-08-15 00:00:00	Jose Perez	Coordinator	2025-08-16 00:00:00	f
9	David Yu	Staff	Finance	Stationery requisition	2025-07-30 00:00:00	Anna Lim	Supervisor	2025-07-31 00:00:00	Carlos Reyes	Manager	2025-08-01 00:00:00	Liza Gomez	Warehouse	2025-08-02 00:00:00	Miguel Santos	Staff	2025-08-03 00:00:00	t
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, username, password_hash, full_name, role, email, phone, date_created) FROM stdin;
3	admin	$2a$12$T7Yud3/PRxF0L.zMrih3IeauhTwzWCiQ7gmvj1aDvI0ER2Ww7LCda	Admin	Admin	admin@root.com	1234567890	2025-08-12 01:15:41.579701
9	chuckz	$2a$12$tD4RFg1NsQOXW6/Vh3yx4uH/blWaHDGF/jBDNM3kfMFp2oxLjZuAS	chuckz	Admin	admin2@root.com	0987654321	2025-08-13 15:01:50.966
18	string	$2a$12$rGB01T51Bxyq6DC4ql0kc.kZznvHQeiHEtEAHfP16PRUUkqKixCJq	string	User	string	string	2025-08-13 15:32:41.649594
\.


--
-- Name: picto_archive_archive_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.picto_archive_archive_id_seq', 19, true);


--
-- Name: picto_inventory_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.picto_inventory_item_id_seq', 29, true);


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
-- Name: requisition_forms_rf_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.requisition_forms_rf_id_seq', 9, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 18, true);


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
-- Name: requisition_archive pk_requisition_archive; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requisition_archive
    ADD CONSTRAINT pk_requisition_archive PRIMARY KEY (rf_id);


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

