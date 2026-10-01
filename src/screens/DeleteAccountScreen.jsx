import React,{useState} from 'react';
import {Building2,Trash2} from 'lucide-react';
import {Banner,Button,Field} from '../components/ui';
import {errorMessage} from '../lib/api';

export default function DeleteAccountScreen({client,onDeleted,onBack}){
 const [password,setPassword]=useState('');const [confirmation,setConfirmation]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 async function submit(e){e.preventDefault();if(!window.confirm('Permanently delete your PG Manager account and associated data? This cannot be undone.'))return;setBusy(true);setError('');try{await client.delete('/auth/account',{data:{currentPassword:password,confirmation}});onDeleted();}catch(err){setError(errorMessage(err,'Could not delete your account. Please try again.'));}finally{setBusy(false)}}
 return <main className="auth-shell"><form className="auth-card" onSubmit={submit}>
  <div className="auth-brand"><span className="brand-mark"><Building2 size={22}/></span><div><h1>Delete PG Manager account</h1><p className="muted">Permanent account and data deletion</p></div></div>
  <div className="empty-state"><Trash2 size={24}/><p className="empty-title">This cannot be undone</p><p className="muted">Your account and associated PG Manager data, including properties you own, rooms, tenant records and rent records, will be permanently deleted. Any recurring PG Manager subscription will be cancelled first.</p></div>
  <Field label="Current password" name="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required/>
  <Field label='Type DELETE to confirm' name="confirmation" value={confirmation} onChange={e=>setConfirmation(e.target.value)} required/>
  <Banner tone="error" onDismiss={()=>setError('')}>{error}</Banner>
  <Button type="submit" variant="danger" loading={busy} disabled={!password||confirmation!=='DELETE'}>Delete account permanently</Button>
  <button type="button" className="text-link center" onClick={onBack}>Back</button>
 </form></main>;
}
