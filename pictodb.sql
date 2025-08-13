--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
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
-- Name: inventory_tracking_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_tracking_history (
    history_id integer NOT NULL,
    item_id integer,
    audit_year integer NOT NULL,
    quantity integer NOT NULL,
    remarks text,
    date_recorded date DEFAULT CURRENT_DATE
);


ALTER TABLE public.inventory_tracking_history OWNER TO postgres;

--
-- Name: inventory_tracking_history_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inventory_tracking_history_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_tracking_history_history_id_seq OWNER TO postgres;

--
-- Name: inventory_tracking_history_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inventory_tracking_history_history_id_seq OWNED BY public.inventory_tracking_history.history_id;


--
-- Name: pc_repair_tracker; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pc_repair_tracker (
    repair_id integer NOT NULL,
    request_form_id integer,
    pc_serial_no character varying(50),
    device_type character varying(50),
    issue_reported text,
    diagnosis text,
    repair_status character varying(20),
    assigned_it_name character varying(100),
    assigned_it_position character varying(100),
    date_received date,
    date_started date,
    date_completed date,
    parts_used text,
    repair_notes text,
    CONSTRAINT pc_repair_tracker_repair_status_check CHECK (((repair_status)::text = ANY ((ARRAY['Pending'::character varying, 'In Progress'::character varying, 'Completed'::character varying, 'Returned'::character varying])::text[])))
);


ALTER TABLE public.pc_repair_tracker OWNER TO postgres;

--
-- Name: pc_repair_tracker_repair_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pc_repair_tracker_repair_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pc_repair_tracker_repair_id_seq OWNER TO postgres;

--
-- Name: pc_repair_tracker_repair_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pc_repair_tracker_repair_id_seq OWNED BY public.pc_repair_tracker.repair_id;


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
    date_added date DEFAULT CURRENT_DATE
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
-- Name: transfer_in; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transfer_in (
    transfer_in_id integer NOT NULL,
    item_id integer,
    quantity integer NOT NULL,
    from_location character varying(100),
    date_received timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    received_by_name character varying(100),
    received_by_position character varying(100),
    remarks text
);


ALTER TABLE public.transfer_in OWNER TO postgres;

--
-- Name: transfer_in_transfer_in_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transfer_in_transfer_in_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transfer_in_transfer_in_id_seq OWNER TO postgres;

--
-- Name: transfer_in_transfer_in_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transfer_in_transfer_in_id_seq OWNED BY public.transfer_in.transfer_in_id;


--
-- Name: transfer_out; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transfer_out (
    transfer_out_id integer NOT NULL,
    item_id integer,
    quantity integer NOT NULL,
    to_location character varying(100),
    date_transferred timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    transferred_by_name character varying(100),
    transferred_by_position character varying(100),
    remarks text
);


ALTER TABLE public.transfer_out OWNER TO postgres;

--
-- Name: transfer_out_transfer_out_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transfer_out_transfer_out_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transfer_out_transfer_out_id_seq OWNER TO postgres;

--
-- Name: transfer_out_transfer_out_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transfer_out_transfer_out_id_seq OWNED BY public.transfer_out.transfer_out_id;


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
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['Super Admin'::character varying, 'Admin'::character varying, 'Staff'::character varying, 'Technician'::character varying])::text[])))
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
-- Name: inventory_tracking_history history_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_tracking_history ALTER COLUMN history_id SET DEFAULT nextval('public.inventory_tracking_history_history_id_seq'::regclass);


--
-- Name: pc_repair_tracker repair_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pc_repair_tracker ALTER COLUMN repair_id SET DEFAULT nextval('public.pc_repair_tracker_repair_id_seq'::regclass);


--
-- Name: picto_inventory item_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.picto_inventory ALTER COLUMN item_id SET DEFAULT nextval('public.picto_inventory_item_id_seq'::regclass);


--
-- Name: request_forms req_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_forms ALTER COLUMN req_id SET DEFAULT nextval('public.request_forms_req_id_seq'::regclass);


--
-- Name: requisition_forms rf_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requisition_forms ALTER COLUMN rf_id SET DEFAULT nextval('public.requisition_forms_rf_id_seq'::regclass);


--
-- Name: transfer_in transfer_in_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transfer_in ALTER COLUMN transfer_in_id SET DEFAULT nextval('public.transfer_in_transfer_in_id_seq'::regclass);


--
-- Name: transfer_out transfer_out_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transfer_out ALTER COLUMN transfer_out_id SET DEFAULT nextval('public.transfer_out_transfer_out_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Data for Name: inventory_tracking_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_tracking_history (history_id, item_id, audit_year, quantity, remarks, date_recorded) FROM stdin;
2	2	2024	5	For staff use	2025-08-11
1	101	2025	15	Initial stock count	2025-08-12
5	11	2025	15	Initial stock count	2025-08-12
6	4	2025	10	Initial inventory count	2025-08-13
7	7	2025	25	Initial stock	2025-08-12
8	8	2025	25	Initial stock added	2025-08-11
\.


--
-- Data for Name: pc_repair_tracker; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pc_repair_tracker (repair_id, request_form_id, pc_serial_no, device_type, issue_reported, diagnosis, repair_status, assigned_it_name, assigned_it_position, date_received, date_started, date_completed, parts_used, repair_notes) FROM stdin;
2	1	SN-IT-2024-01	Desktop PC	PC not booting, beeping sounds	Faulty RAM module	Completed	Mark Reyes	IT Technician	2024-02-10	2024-02-11	2024-02-12	RAM 8GB DDR4, cleaned heatsink	Replaced faulty RAM, performed stress test
\.


--
-- Data for Name: picto_inventory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.picto_inventory (item_id, item_name, description, category, quantity, unit, location, status, date_added) FROM stdin;
101	Ergonomic Office Chair	Comfortable office chair with adjustable height and lumbar support	Office Furniture	15	pcs	Main Office	Available	2025-08-12
11	Ergonomic Office Chair	Comfortable office chair	Office Furniture	15	pcs	Main Office	Available	2025-08-12
4	Office Desk	Wooden office desk	Office Furniture	10	pcs	Main Office	Available	2025-08-13
5	Projector	HD projector for meetings	IT Equipment	5	pcs	Conference Room	Available	2025-08-13
6	Wireless Mouse	Ergonomic wireless mouse	IT Equipment	25	pcs	IT Office	Available	2025-08-12
7	Wireless Mouse	Ergonomic wireless mouse	IT Equipment	25	pcs	IT Office	Available	2025-08-12
8	Wireless Mouse	Ergonomic wireless mouse	IT Equipment	25	pcs	IT Office	Available	2025-08-11
9	Laptop	\N	Electronics	5	\N	\N	Available	2025-08-12
10	Laptop	HP OMEN 17 TRANSCEND	Electronics	10	\N	\N	Available	2025-08-12
2	Laptop Updated	HP OMEN 17 TRANSCEND Updated	Electronics	15	pcs	IT Office	Available	2025-08-12
14	Laptop	HP OMEN 17 TRANSCEND	Electronics	10	pcs	IT Office	Available	2025-08-12
15	Laptop	HP OMEN 17 TRANSCEND	Electronics	10	pcs	IT Office	Available	2025-08-12
16	Laptop	HP OMEN 17 TRANSCEND	Electronics	10	pcs	IT Office	Available	2025-08-12
17	Laptop	HP OMEN 17 TRANSCEND	Electronics	10	pcs	IT Office	Available	2025-08-12
21	WORKSTATION	HP Z5	Electronics	1	pcs	IT Office	Available	2025-08-11
\.


--
-- Data for Name: request_forms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.request_forms (req_id, requestor_name, requestor_position, department, issue_description, date_requested, checked_by_name, checked_by_position, checked_by_date, approved_by_name, approved_by_position, approved_by_date, issued_by_name, issued_by_position, issued_by_date, received_by_name, received_by_position, received_by_date) FROM stdin;
1	Sample Requestor	\N	\N	\N	2025-08-11 19:13:11.619606	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
2	Sample Requestor	\N	\N	\N	2025-08-11 19:14:43.976694	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: requisition_forms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.requisition_forms (rf_id, requester_name, requester_position, department, purpose, date_requested, checked_by_name, checked_by_position, checked_by_date, approved_by_name, approved_by_position, approved_by_date, issued_by_name, issued_by_position, issued_by_date, received_by_name, received_by_position, received_by_date, is_archived) FROM stdin;
2	string	string	string	string	2025-08-12 19:09:33.451	string	string	2025-08-12 19:09:33.451	string	string	2025-08-12 19:09:33.451	string	string	2025-08-12 19:09:33.451	string	string	2025-08-12 19:09:33.451	f
3	string	string	string	string	2025-08-12 19:09:33.451	string	string	2025-08-12 19:09:33.451	string	string	2025-08-12 19:09:33.451	string	string	2025-08-12 19:09:33.451	string	string	2025-08-12 19:09:33.451	f
4	string	string	string	string	2025-08-12 19:09:33.451	string	string	2025-08-12 19:09:33.451	string	string	2025-08-12 19:09:33.451	string	string	2025-08-12 19:09:33.451	string	string	2025-08-12 19:09:33.451	f
1	string	string	string	string	2025-08-12 19:18:29.165	string	string	2025-08-12 19:18:29.165	string	string	2025-08-12 19:18:29.165	string	string	2025-08-12 19:18:29.165	string	string	2025-08-12 19:18:29.165	f
5	Alice Johnson	HR Manager	Human Resources	Office supplies for onboarding	2025-08-10 02:30:00	Mark Spencer	Inventory Supervisor	2025-08-11 03:00:00	Sarah Lee	Operations Head	2025-08-11 07:00:00	John Doe	Warehouse Manager	2025-08-12 01:00:00	Alice Johnson	HR Manager	2025-08-12 08:30:00	f
6	Alice Johnson	HR Manager	Human Resources	Office supplies for onboarding	2025-08-09 19:30:00	Mark Spencer	Inventory Supervisor	2025-08-10 20:00:00	Sarah Lee	Operations Head	2025-08-11 00:00:00	John Doe	Warehouse Manager	2025-08-11 18:00:00	Alice Johnson	HR Manager	2025-08-12 01:30:00	f
7	Alice Johnson	HR Manager	Human Resources	Office supplies for onboarding	2025-08-09 19:30:00	Mark Spencer	Inventory Supervisor	2025-08-10 20:00:00	Sarah Lee	Operations Head	2025-08-11 00:00:00	John Doe	Warehouse Manager	2025-08-11 18:00:00	Alice Johnson	HR Manager	2025-08-12 01:30:00	f
8	Alice Johnson	HR Manager	Human Resources	Office supplies for onboarding	2025-08-09 19:30:00	Mark Spencer	Inventory Supervisor	2025-08-10 20:00:00	Sarah Lee	Operations Head	2025-08-11 00:00:00	John Doe	Warehouse Manager	2025-08-11 18:00:00	Alice Johnson	HR Manager	2025-08-12 01:30:00	f
9	Test User	Tester	QA	Testing API	2025-08-15 05:00:00	Checker	Supervisor	2025-08-15 06:00:00	Approver	Manager	2025-08-15 07:00:00	Issuer	Warehouse	2025-08-15 08:00:00	Receiver	QA	2025-08-15 09:00:00	f
\.


--
-- Data for Name: transfer_in; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transfer_in (transfer_in_id, item_id, quantity, from_location, date_received, received_by_name, received_by_position, remarks) FROM stdin;
1	101	10	Warehouse A	2025-07-15 02:30:00	Alice Mendoza	Inventory Manager	Received from main supplier
3	11	10	Warehouse A	2025-07-15 02:30:00	Alice Mendoza	Inventory Manager	Received from main supplier
4	5	5	Warehouse B	2025-08-10 02:00:00	John Doe	Inventory Clerk	New stock arrival
5	7	10	Warehouse	2025-08-10 02:30:00	John Doe	Inventory Manager	Restock
6	8	10	Warehouse	2025-08-09 17:00:00	John Doe	Inventory Manager	Restock
\.


--
-- Data for Name: transfer_out; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transfer_out (transfer_out_id, item_id, quantity, to_location, date_transferred, transferred_by_name, transferred_by_position, remarks) FROM stdin;
1	101	5	Branch Office	2025-08-01 07:45:00	Bob Santos	Logistics Coordinator	Transferred for branch setup
2	11	5	Branch Office	2025-08-01 07:45:00	Bob Santos	Logistics Coordinator	Transferred for branch setup
3	5	2	Branch Office	2025-08-12 07:00:00	Jane Smith	Logistics Manager	Loan for presentation
4	7	5	Sales Dept	2025-08-15 07:00:00	Jane Smith	Logistics Officer	Transferred for office use
5	8	5	Sales Dept	2025-08-14 17:00:00	Jane Smith	Logistics Officer	Transferred for office use
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, username, password_hash, full_name, role, email, phone, date_created) FROM stdin;
3	admin	$2a$12$T7Yud3/PRxF0L.zMrih3IeauhTwzWCiQ7gmvj1aDvI0ER2Ww7LCda	Admin User	Admin	admin@example.com	1234567890	2025-08-12 01:15:41.579701
\.


--
-- Name: inventory_tracking_history_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventory_tracking_history_history_id_seq', 8, true);


--
-- Name: pc_repair_tracker_repair_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pc_repair_tracker_repair_id_seq', 2, true);


--
-- Name: picto_inventory_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.picto_inventory_item_id_seq', 22, true);


--
-- Name: request_forms_req_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.request_forms_req_id_seq', 2, true);


--
-- Name: requisition_forms_rf_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.requisition_forms_rf_id_seq', 9, true);


--
-- Name: transfer_in_transfer_in_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transfer_in_transfer_in_id_seq', 6, true);


--
-- Name: transfer_out_transfer_out_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transfer_out_transfer_out_id_seq', 5, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 5, true);


--
-- Name: inventory_tracking_history inventory_tracking_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_tracking_history
    ADD CONSTRAINT inventory_tracking_history_pkey PRIMARY KEY (history_id);


--
-- Name: pc_repair_tracker pc_repair_tracker_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pc_repair_tracker
    ADD CONSTRAINT pc_repair_tracker_pkey PRIMARY KEY (repair_id);


--
-- Name: picto_inventory picto_inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.picto_inventory
    ADD CONSTRAINT picto_inventory_pkey PRIMARY KEY (item_id);


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
-- Name: transfer_in transfer_in_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transfer_in
    ADD CONSTRAINT transfer_in_pkey PRIMARY KEY (transfer_in_id);


--
-- Name: transfer_out transfer_out_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transfer_out
    ADD CONSTRAINT transfer_out_pkey PRIMARY KEY (transfer_out_id);


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
-- Name: inventory_tracking_history inventory_tracking_history_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_tracking_history
    ADD CONSTRAINT inventory_tracking_history_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.picto_inventory(item_id) ON DELETE CASCADE;


--
-- Name: pc_repair_tracker pc_repair_tracker_request_form_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pc_repair_tracker
    ADD CONSTRAINT pc_repair_tracker_request_form_id_fkey FOREIGN KEY (request_form_id) REFERENCES public.request_forms(req_id) ON DELETE CASCADE;


--
-- Name: transfer_in transfer_in_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transfer_in
    ADD CONSTRAINT transfer_in_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.picto_inventory(item_id) ON DELETE CASCADE;


--
-- Name: transfer_out transfer_out_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transfer_out
    ADD CONSTRAINT transfer_out_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.picto_inventory(item_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

