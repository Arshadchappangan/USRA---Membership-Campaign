import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiArrowLeft, FiEdit2, FiSave, FiLoader, FiCheck,
    FiAlertCircle, FiPhone, FiCalendar,
    FiHeart, FiUser, FiHash, FiUsers, FiBriefcase,
    FiBook, FiAward, FiPlus, FiTrash2, FiChevronDown,
    FiCamera, FiLogOut, FiShield,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { getMemberById, updateMember } from "../utils/api";
import Navbar from "../components/Navbar";

const ACCENT_PAIRS = [
    ["#4EAEE5","#9B59B6"],["#9B59B6","#E91E8C"],["#E91E8C","#4EAEE5"],
    ["#4EAEE5","#43B89C"],["#F7971E","#E91E8C"],["#43B89C","#9B59B6"],
];
const MARITAL_OPTIONS   = ["Single","Married","Divorced","Widowed"];
const EDUCATION_OPTIONS = ["Below 10th","10th Pass","12th Pass","Diploma","ITI","Graduate","Post Graduate","PhD","Other"];
const EMPLOYMENT_TYPES  = ["Employed","Self-Employed","Business","Student","Homemaker","Unemployed","Retired"];
const BLOOD_GROUPS      = ["A+","A-","B+","B-","AB+","AB-","O+","O-","Unknown"];
const SECTORS = ["Government","Private","Public Sector","NGO / Non-Profit","Military / Defence","Education","Healthcare","Agriculture","IT / Tech","Finance","Other"];

const accentFor  = (n="") => ACCENT_PAIRS[n.length % ACCENT_PAIRS.length];
const initials   = (n="") => n.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();
const fmtDate    = (d) => d ? new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "—";
const toDateInput= (d) => { try { return d ? new Date(d).toISOString().split("T")[0] : ""; } catch { return ""; } };

function Input({value,onChange,placeholder,type="text"}) {
    return <input type={type} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-800 outline-none transition-all"
        style={{background:"rgba(78,174,229,0.05)",border:"1.5px solid rgba(78,174,229,0.2)"}}
        onFocus={e=>e.target.style.borderColor="#4EAEE5"} onBlur={e=>e.target.style.borderColor="rgba(78,174,229,0.2)"}/>;
}
function SelectInput({value,onChange,options,placeholder}) {
    return <div className="relative">
        <select value={value||""} onChange={e=>onChange(e.target.value)}
            className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl text-sm font-medium text-gray-800 outline-none cursor-pointer transition-all"
            style={{background:"rgba(78,174,229,0.05)",border:"1.5px solid rgba(78,174,229,0.2)"}}
            onFocus={e=>e.target.style.borderColor="#4EAEE5"} onBlur={e=>e.target.style.borderColor="rgba(78,174,229,0.2)"}>
            {placeholder && <option value="">{placeholder}</option>}
            {options.map(o=><option key={o} value={o}>{o}</option>)}
        </select>
        <FiChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
    </div>;
}
function Textarea({value,onChange,placeholder,rows=3}) {
    return <textarea value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className="w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-800 outline-none transition-all resize-none"
        style={{background:"rgba(78,174,229,0.05)",border:"1.5px solid rgba(78,174,229,0.2)"}}
        onFocus={e=>e.target.style.borderColor="#4EAEE5"} onBlur={e=>e.target.style.borderColor="rgba(78,174,229,0.2)"}/>;
}
function Field({label,value,edit,children,span2=false}) {
    return <div className={span2?"col-span-2":""}>
        <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">{label}</label>
        {edit ? children : <p className="text-sm font-semibold text-gray-800">{value||<span className="text-gray-300 italic font-normal">Not set</span>}</p>}
    </div>;
}
function Divider() { return <div className="my-5" style={{height:"1px",background:"rgba(78,174,229,0.1)"}}/>; }

function SectionCard({icon:Icon,title,color="#4EAEE5",editMode,onToggle,saving,children,hint}) {
    return <div className="rounded-3xl p-5 sm:p-6 transition-all"
        style={{background:"rgba(255,255,255,0.88)",border:"1.5px solid rgba(78,174,229,0.14)",backdropFilter:"blur(10px)",boxShadow:"0 4px 20px rgba(78,174,229,0.06)"}}>
        <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0" style={{background:`${color}15`}}>
                    <Icon size={16} style={{color}}/>
                </div>
                <div>
                    <h2 className="text-sm font-black text-gray-800 tracking-tight">{title}</h2>
                    {hint && <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>}
                </div>
            </div>
            <button onClick={onToggle} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                style={editMode
                    ?{background:"linear-gradient(135deg,#4EAEE5,#9B59B6)",color:"#fff",boxShadow:"0 4px 14px rgba(78,174,229,0.3)"}
                    :{background:"rgba(78,174,229,0.08)",color:"#4EAEE5",border:"1px solid rgba(78,174,229,0.2)"}}>
                {saving ? <FiLoader size={12} className="animate-spin"/>
                    : editMode ? <><FiSave size={12}/> Save Changes</> : <><FiEdit2 size={12}/> Edit</>}
            </button>
        </div>
        {children}
    </div>;
}

function EduCard({item,index,edit,onChange,onRemove}) {
    return <div className="rounded-2xl p-4 mb-3 relative" style={{background:"rgba(155,89,182,0.05)",border:"1.5px solid rgba(155,89,182,0.14)"}}>
        {edit && <button onClick={()=>onRemove(index)} className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50"><FiTrash2 size={13}/></button>}
        {edit ? <div className="grid grid-cols-2 gap-3 pr-8">
            <SelectInput value={item.level}       onChange={v=>onChange(index,"level",v)}       options={EDUCATION_OPTIONS} placeholder="Level"/>
            <Input       value={item.field}       onChange={v=>onChange(index,"field",v)}       placeholder="Field / Subject"/>
            <Input       value={item.institution} onChange={v=>onChange(index,"institution",v)} placeholder="Institution"/>
            <Input       value={item.year}        onChange={v=>onChange(index,"year",v)}        placeholder="Year"/>
        </div> : <div className="flex items-start justify-between gap-2">
            <div>
                <p className="text-sm font-black text-gray-800">{item.level||"—"}{item.field?` · ${item.field}`:""}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.institution||"—"}</p>
            </div>
            {item.year && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 flex-shrink-0" style={{background:"rgba(155,89,182,0.1)",color:"#534AB7",border:"1px solid rgba(155,89,182,0.2)"}}>{item.year}</span>}
        </div>}
    </div>;
}

function ExpCard({item,index,edit,onChange,onRemove}) {
    return <div className="rounded-2xl p-4 mb-3 relative" style={{background:"rgba(233,30,140,0.04)",border:"1.5px solid rgba(233,30,140,0.12)"}}>
        {edit && <button onClick={()=>onRemove(index)} className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50"><FiTrash2 size={13}/></button>}
        {edit ? <div className="grid grid-cols-2 gap-3 pr-8">
            <Input value={item.title}        onChange={v=>onChange(index,"title",v)}        placeholder="Job Title / Role"/>
            <Input value={item.organisation} onChange={v=>onChange(index,"organisation",v)} placeholder="Organisation"/>
            <Input value={item.from}         onChange={v=>onChange(index,"from",v)}         placeholder="From (e.g. 2019)"/>
            <Input value={item.to}           onChange={v=>onChange(index,"to",v)}           placeholder="To / Present"/>
            <div className="col-span-2"><Textarea value={item.description} onChange={v=>onChange(index,"description",v)} placeholder="Brief description…" rows={2}/></div>
        </div> : <>
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-sm font-black text-gray-800">{item.title||"—"}</p>
                    <p className="text-xs font-semibold text-gray-500 mt-0.5">{item.organisation||"—"}</p>
                </div>
                {(item.from||item.to) && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{background:"rgba(233,30,140,0.08)",color:"#993556",border:"1px solid rgba(233,30,140,0.15)"}}>{[item.from,item.to].filter(Boolean).join(" → ")}</span>}
            </div>
            {item.description && <p className="text-xs text-gray-500 mt-2 leading-relaxed">{item.description}</p>}
        </>}
    </div>;
}

function EmptyCard({icon:Icon,title,hint,color}) {
    return <div className="flex flex-col items-center py-10 text-center rounded-2xl" style={{background:`${color}06`,border:`1.5px dashed ${color}30`}}>
        <Icon size={28} style={{color:`${color}50`}}/>
        <p className="text-sm font-bold text-gray-400 mt-2">{title}</p>
        <p className="text-xs text-gray-300 mt-1">{hint}</p>
    </div>;
}

function Toast({msg,type,onDone}) {
    useEffect(()=>{ if(msg){const t=setTimeout(onDone,3000);return()=>clearTimeout(t);} },[msg]);
    if(!msg) return null;
    const ok=type!=="error";
    return <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-bold shadow-2xl whitespace-nowrap"
        style={{background:ok?"#22c55e":"#ef4444",color:"#fff",animation:"slideUp 0.3s ease",boxShadow:ok?"0 8px 30px rgba(34,197,94,0.4)":"0 8px 30px rgba(239,68,68,0.4)"}}>
        <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(16px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
        {ok?<FiCheck size={15}/>:<FiAlertCircle size={15}/>} {msg}
    </div>;
}

function ProfileHero({member,from,to}) {
    const isPaid=member.paymentStatus==="completed";
    return <div className="relative rounded-3xl overflow-hidden mb-6"
        style={{background:`linear-gradient(135deg,${from}18,${to}12)`,border:"1.5px solid rgba(78,174,229,0.15)",padding:"24px 20px"}}>
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full pointer-events-none opacity-10" style={{background:`radial-gradient(circle,${from},transparent)`}}/>
        <div className="flex items-start gap-4 sm:gap-5 relative">
            <div className="relative group flex-shrink-0 cursor-pointer">
                <div className="flex items-center justify-center rounded-2xl font-black text-white select-none overflow-hidden"
                    style={{width:72,height:72,background:`linear-gradient(135deg,${from},${to})`,fontSize:24,boxShadow:`0 8px 24px ${from}50`}}>
                    {member.photo?<img src={member.photo} alt={member.name} className="w-full h-full object-cover"/>:initials(member.name)}
                </div>
                <button className="absolute inset-0 flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{background:"rgba(0,0,0,0.45)"}}>
                    <FiCamera size={16} color="#fff"/>
                </button>
            </div>
            <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">{member.name}</h1>
                {member.jobTitle && <p className="text-sm text-gray-500 font-medium mt-0.5">{member.jobTitle}{member.organisation?` · ${member.organisation}`:""}</p>}
                <p className="text-xs font-mono text-gray-400 mt-1 mb-2.5">{member.memberId}</p>
                <div className="flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                        style={isPaid?{background:"#EAF3DE",color:"#3B6D11",border:"0.5px solid #C0DD97"}:{background:"#FAEEDA",color:"#854F0B",border:"0.5px solid #FAC775"}}>
                        {isPaid?"✓ Paid":"⏳ Pending"}
                    </span>
                    {member.bloodGroup && <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold" style={{background:"#FBEAF0",color:"#72243E",border:"0.5px solid #F4C0D1"}}><FiHeart size={8}/> {member.bloodGroup}</span>}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold" style={member.gender==="Female"?{background:"#EEEDFE",color:"#3C3489",border:"0.5px solid #CECBF6"}:{background:"#E6F1FB",color:"#185FA5",border:"0.5px solid #B5D4F4"}}>{member.gender}</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold" style={{background:"rgba(78,174,229,0.1)",color:"#185FA5",border:"0.5px solid rgba(78,174,229,0.25)"}}><FiShield size={8}/> Since {fmtDate(member.createdAt)}</span>
                </div>
            </div>
        </div>
    </div>;
}

export default function ProfilePage() {
    const navigate=useNavigate();
    const {user,logout}=useAuth();
    const [member,setMember]=useState(null);
    const [draft,setDraft]=useState(null);
    const [loading,setLoading]=useState(true);
    const [saving,setSaving]=useState({});
    const [editMode,setEditMode]=useState({});
    const [toast,setToast]=useState({msg:"",type:""});

    useEffect(()=>{
        if(!user){navigate("/login",{state:{from:{pathname:"/profile"}}});return;}
        (async()=>{
            try{
                setLoading(true);
                const res=await getMemberById(user._id);
                const m=res.data||res;
                setMember(m);
                buildDraft(m);
            }catch{setToast({msg:"Failed to load profile.",type:"error"});}
            finally{setLoading(false);}
        })();
    },[user]);

    const buildDraft=(m)=>setDraft({
        dob:toDateInput(m.dob), gender:m.gender||"", bloodGroup:m.bloodGroup||"",
        father:m.father||"", mother:m.mother||"",
        maritalStatus:m.maritalStatus||"",
        spouseName:m.spouse||"",         // schema: "spouse" → draft: "spouseName"
        spousePhone:m.spousePhone||"", spouseJob:m.spouseJob||"", children:m.children||"",
        bio:m.bio||"",
        phone:m.phone||"", place:m.place||"", houseName:m.houseName||"", email:m.email||"",
        employmentType:m.employmentType||"", sector:m.sector||"",
        organisation:m.organisation||"", jobTitle:m.jobTitle||"",
        jobLocation:m.jobLocation||"",
        annualIncome:m.annualIncome!=null?String(m.annualIncome):"",
        skills:m.skills||"",
        highestQualification:m.highestQualification||"",
        educations:Array.isArray(m.educations)?m.educations:[],
        experiences:Array.isArray(m.experiences)?m.experiences:[],
    });

    const set    = k=>v=>setDraft(d=>({...d,[k]:v}));
    const setArr = (k,i,f,v)=>setDraft(d=>{const a=[...(d[k]||[])];a[i]={...a[i],[f]:v};return{...d,[k]:a};});
    const addArr = (k,blank)=>setDraft(d=>({...d,[k]:[...(d[k]||[]),blank]}));
    const rmArr  = (k,i)=>setDraft(d=>{const a=[...(d[k]||[])];a.splice(i,1);return{...d,[k]:a};});

    const toggleEdit=async(section)=>{
        if(editMode[section]){
            setSaving(s=>({...s,[section]:true}));
            try{
                const res=await updateMember(member._id,draft);
                const updated=res.data||res;
                setMember(updated);
                buildDraft(updated);
                setToast({msg:"Saved successfully!",type:"success"});
                setEditMode(e=>({...e,[section]:false}));
            }catch(err){
                setToast({msg:err?.response?.data?.message||"Failed to save. Try again.",type:"error"});
            }finally{
                setSaving(s=>({...s,[section]:false}));
            }
        }else{
            setEditMode({[section]:true});
        }
    };

    if(!user) return null;
    if(loading) return <div className="min-h-screen flex items-center justify-center" style={{background:"linear-gradient(145deg,#f0f4ff,#faf5ff)"}}>
        <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{background:"linear-gradient(135deg,#4EAEE5,#9B59B6)"}}>
                <FiLoader size={20} color="#fff" className="animate-spin"/>
            </div>
            <p className="text-sm font-semibold text-gray-400">Loading your profile…</p>
        </div>
    </div>;
    if(!member||!draft) return null;

    const [from,to]=accentFor(member.name);
    const isMarried=draft.maritalStatus==="Married";
    const eduCount=(draft.educations||[]).length;
    const expCount=(draft.experiences||[]).length;

    return <div className="min-h-screen" style={{background:"linear-gradient(145deg,#f0f4ff 0%,#faf5ff 50%,#f0fff8 100%)"}}>
        <Navbar/>
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10" style={{background:`radial-gradient(circle,${from},transparent)`}}/>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-8" style={{background:`radial-gradient(circle,${to},transparent)`}}/>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 pt-24 pb-20">
            <div className="flex items-center justify-between mb-5">
                <button onClick={()=>navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">
                    <FiArrowLeft size={15}/> Back
                </button>
                <button onClick={()=>{logout();navigate("/");}}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
                    style={{border:"1.5px solid rgba(239,68,68,0.2)"}}>
                    <FiLogOut size={14}/> Sign Out
                </button>
            </div>

            <ProfileHero member={member} from={from} to={to}/>

            <div className="space-y-5">

                {/* 1. Personal */}
                <SectionCard icon={FiUser} title="Personal Details" color="#9B59B6"
                    editMode={editMode.personal} saving={saving.personal}
                    onToggle={()=>toggleEdit("personal")} hint="DOB, parents, gender, blood group">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Date of Birth"  value={fmtDate(member.dob)}    edit={editMode.personal}><Input value={draft.dob}        onChange={set("dob")}        type="date"/></Field>
                        <Field label="Gender"         value={member.gender}           edit={editMode.personal}><SelectInput value={draft.gender}     onChange={set("gender")}     options={["Male","Female","Other"]} placeholder="Select"/></Field>
                        <Field label="Blood Group"    value={member.bloodGroup}       edit={editMode.personal}><SelectInput value={draft.bloodGroup}  onChange={set("bloodGroup")}  options={BLOOD_GROUPS} placeholder="Select"/></Field>
                        <Field label="Marital Status" value={member.maritalStatus}    edit={editMode.personal}><SelectInput value={draft.maritalStatus} onChange={set("maritalStatus")} options={MARITAL_OPTIONS} placeholder="Select"/></Field>
                        <Field label="Father's Name"  value={member.father}           edit={editMode.personal}><Input value={draft.father}      onChange={set("father")}      placeholder="Father's full name"/></Field>
                        <Field label="Mother's Name"  value={member.mother}           edit={editMode.personal}><Input value={draft.mother}      onChange={set("mother")}      placeholder="Mother's full name"/></Field>
                    </div>
                    {isMarried && <>
                        <div className="flex items-center gap-3 my-5">
                            <div className="h-px flex-1" style={{background:"rgba(233,30,140,0.15)"}}/>
                            <span className="text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full" style={{background:"rgba(233,30,140,0.07)",color:"#E91E8C",border:"1px solid rgba(233,30,140,0.15)"}}>Spouse Details</span>
                            <div className="h-px flex-1" style={{background:"rgba(233,30,140,0.15)"}}/>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Spouse Name"       value={member.spouse}     edit={editMode.personal}><Input value={draft.spouseName}  onChange={set("spouseName")}  placeholder="Full name"/></Field>
                            <Field label="Spouse Phone"      value={member.spousePhone} edit={editMode.personal}><Input value={draft.spousePhone} onChange={set("spousePhone")} placeholder="+91 XXXXX XXXXX" type="tel"/></Field>
                            <Field label="Spouse Occupation" value={member.spouseJob}  edit={editMode.personal}><Input value={draft.spouseJob}   onChange={set("spouseJob")}   placeholder="Job / Occupation"/></Field>
                            <Field label="No. of Children"   value={member.children}   edit={editMode.personal}><Input value={draft.children}    onChange={set("children")}    placeholder="0" type="number"/></Field>
                        </div>
                    </>}
                </SectionCard>

                {/* 2. About */}
                <SectionCard icon={FiUsers} title="About Me" color="#43B89C"
                    editMode={editMode.bio} saving={saving.bio}
                    onToggle={()=>toggleEdit("bio")} hint="A short bio visible to others">
                    <Field label="Bio / Short Note" value={member.bio} edit={editMode.bio}>
                        <Textarea value={draft.bio} onChange={set("bio")} placeholder="Write something about yourself…" rows={4}/>
                    </Field>
                </SectionCard>

                {/* 3. Contact */}
                <SectionCard icon={FiPhone} title="Contact Information" color="#4EAEE5"
                    editMode={editMode.contact} saving={saving.contact}
                    onToggle={()=>toggleEdit("contact")} hint="Phone, email, city and address">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Phone"      value={member.phone}     edit={editMode.contact}><Input value={draft.phone}     onChange={set("phone")}     placeholder="9876543210" type="tel"/></Field>
                        <Field label="Email"      value={member.email}     edit={editMode.contact}><Input value={draft.email}     onChange={set("email")}     placeholder="you@example.com" type="email"/></Field>
                        <Field label="Place/City" value={member.place}     edit={editMode.contact}><Input value={draft.place}     onChange={set("place")}     placeholder="City or Town"/></Field>
                        <Field label="House Name" value={member.houseName} edit={editMode.contact}><Input value={draft.houseName} onChange={set("houseName")} placeholder="House / Building name"/></Field>
                    </div>
                </SectionCard>

                {/* 4. Career */}
                <SectionCard icon={FiBriefcase} title="Career & Employment" color="#F7971E"
                    editMode={editMode.career} saving={saving.career}
                    onToggle={()=>toggleEdit("career")} hint="Current job, sector and income">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Employment Type" value={member.employmentType} edit={editMode.career} span2>
                            <SelectInput value={draft.employmentType} onChange={set("employmentType")} options={EMPLOYMENT_TYPES} placeholder="Select type"/>
                        </Field>
                        <Field label="Sector"        value={member.sector}       edit={editMode.career}><SelectInput value={draft.sector}       onChange={set("sector")}       options={SECTORS} placeholder="Select sector"/></Field>
                        <Field label="Organisation"  value={member.organisation} edit={editMode.career}><Input value={draft.organisation} onChange={set("organisation")} placeholder="Company / Org"/></Field>
                        <Field label="Job Title"     value={member.jobTitle}     edit={editMode.career}><Input value={draft.jobTitle}     onChange={set("jobTitle")}     placeholder="Designation"/></Field>
                        <Field label="Work Location" value={member.jobLocation}  edit={editMode.career}><Input value={draft.jobLocation}  onChange={set("jobLocation")}  placeholder="City or Remote"/></Field>
                        <Field label="Annual Income (₹)" value={member.annualIncome!=null?`₹ ${Number(member.annualIncome).toLocaleString("en-IN")}`:""} edit={editMode.career}>
                            <Input value={draft.annualIncome} onChange={set("annualIncome")} placeholder="e.g. 500000" type="number"/>
                        </Field>
                    </div>
                    <Divider/>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-3">Skills & Expertise</p>
                    <Field label="Skills" value={member.skills} edit={editMode.career}>
                        <Textarea value={draft.skills} onChange={set("skills")} placeholder="e.g. Teaching, Driving, Carpentry…"/>
                    </Field>
                </SectionCard>

                {/* 5. Experience */}
                <SectionCard icon={FiAward} title="Work Experience" color="#E91E8C"
                    editMode={editMode.experience} saving={saving.experience}
                    onToggle={()=>toggleEdit("experience")} hint={`${expCount} ${expCount===1?"entry":"entries"}`}>
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">{expCount} {expCount===1?"entry":"entries"}</p>
                        {editMode.experience && <button onClick={()=>addArr("experiences",{title:"",organisation:"",from:"",to:"",description:""})}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold active:scale-95"
                            style={{background:"rgba(233,30,140,0.08)",color:"#993556",border:"1px solid rgba(233,30,140,0.18)"}}>
                            <FiPlus size={11}/> Add Entry
                        </button>}
                    </div>
                    {expCount===0 ? <EmptyCard icon={FiBriefcase} title="No experience added" hint="Click Edit to add work history" color="#E91E8C"/>
                        : (draft.experiences||[]).map((item,i)=><ExpCard key={i} item={item} index={i} edit={editMode.experience}
                            onChange={(idx,f,v)=>setArr("experiences",idx,f,v)} onRemove={idx=>rmArr("experiences",idx)}/>)}
                </SectionCard>

                {/* 6. Education */}
                <SectionCard icon={FiBook} title="Education" color="#9B59B6"
                    editMode={editMode.education} saving={saving.education}
                    onToggle={()=>toggleEdit("education")} hint={`Highest: ${member.highestQualification||"Not set"}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                        <Field label="Highest Qualification" value={member.highestQualification} edit={editMode.education} span2>
                            <SelectInput value={draft.highestQualification} onChange={set("highestQualification")} options={EDUCATION_OPTIONS} placeholder="Select highest level"/>
                        </Field>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Qualifications ({eduCount})</p>
                        {editMode.education && <button onClick={()=>addArr("educations",{level:"",field:"",institution:"",year:""})}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold active:scale-95"
                            style={{background:"rgba(155,89,182,0.1)",color:"#534AB7",border:"1px solid rgba(155,89,182,0.2)"}}>
                            <FiPlus size={11}/> Add
                        </button>}
                    </div>
                    {eduCount===0 ? <EmptyCard icon={FiBook} title="No qualifications added" hint="Click Edit to add" color="#9B59B6"/>
                        : (draft.educations||[]).map((item,i)=><EduCard key={i} item={item} index={i} edit={editMode.education}
                            onChange={(idx,f,v)=>setArr("educations",idx,f,v)} onRemove={idx=>rmArr("educations",idx)}/>)}
                </SectionCard>

                {/* 7. Membership read-only */}
                <div className="rounded-3xl p-5 sm:p-6" style={{background:"rgba(255,255,255,0.6)",border:"1.5px solid rgba(78,174,229,0.1)"}}>
                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex items-center justify-center w-9 h-9 rounded-xl" style={{background:"rgba(78,174,229,0.1)"}}><FiHash size={16} style={{color:"#4EAEE5"}}/></div>
                        <div><h2 className="text-sm font-black text-gray-800">Membership Info</h2><p className="text-[11px] text-gray-400 mt-0.5">Read-only · Contact admin to update</p></div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <Field label="Member ID"      value={member.memberId}/>
                        <Field label="Joined"         value={fmtDate(member.createdAt)}/>
                        <Field label="Payment Status" value={member.paymentStatus==="completed"?"✓ Paid":"⏳ Pending"}/>
                    </div>
                </div>

            </div>
        </div>
        <Toast msg={toast.msg} type={toast.type} onDone={()=>setToast({msg:"",type:""})}/>
    </div>;
}