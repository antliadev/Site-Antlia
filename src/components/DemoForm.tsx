import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, ShieldCheck } from 'lucide-react'

export type FormKind = 'contact' | 'admission' | 'individual' | 'company' | 'talent' | 'application'
type Field = { name: string; label: string; type?: string; options?: string[]; wide?: boolean; optional?: boolean }

const identity: Field[] = [
  { name: 'name', label: 'Nome fictício', type: 'text' },
  { name: 'email', label: 'E-mail de teste', type: 'email' },
]
const fields: Record<FormKind, Field[]> = {
  contact: [...identity, { name: 'company', label: 'Empresa fictícia' }, { name: 'interest', label: 'Interesse', options: ['Desenvolvimento de software', 'Outsourcing de TI', 'Quality Assurance', 'Help Desk', 'Alocação de profissionais', 'Outro'] }, { name: 'message', label: 'Contexto do projeto', type: 'textarea', wide: true }],
  admission: [...identity, { name: 'position', label: 'Cargo de teste' }, { name: 'start', label: 'Data prevista de início', type: 'date' }, { name: 'location', label: 'Cidade / UF de teste' }, { name: 'schedule', label: 'Modelo de trabalho', options: ['Presencial', 'Híbrido', 'Remoto', 'A definir'] }],
  individual: [...identity, { name: 'specialty', label: 'Especialidade profissional' }, { name: 'availability', label: 'Disponibilidade', options: ['Integral', 'Parcial', 'Por projeto'] }, { name: 'experience', label: 'Experiência profissional fictícia', type: 'textarea', wide: true }],
  company: [{ name: 'company', label: 'Razão social fictícia' }, { name: 'tradeName', label: 'Nome fantasia fictício' }, { name: 'representative', label: 'Representante fictício' }, { name: 'email', label: 'E-mail corporativo de teste', type: 'email' }, { name: 'service', label: 'Serviços oferecidos', type: 'textarea', wide: true }],
  talent: [...identity, { name: 'area', label: 'Área de interesse', options: ['Desenvolvimento', 'Qualidade', 'Dados', 'Suporte', 'Gestão de projetos', 'Outras áreas'] }, { name: 'level', label: 'Nível de experiência', options: ['Estágio', 'Júnior', 'Pleno', 'Sênior', 'Especialista', 'Gestão'] }, { name: 'summary', label: 'Trajetória fictícia', type: 'textarea', wide: true }],
  application: [...identity, { name: 'availability', label: 'Disponibilidade para início', options: ['Imediata', 'Em até 30 dias', 'A combinar'] }, { name: 'summary', label: 'Experiência fictícia relacionada à vaga', type: 'textarea', wide: true }],
}

export function DemoForm({ kind, title, role, level }: { kind: FormKind; title: string; role?: string; level?: string }) {
  const [complete, setComplete] = useState(false)
  const [error, setError] = useState('')
  const status = useRef<HTMLDivElement>(null)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity()) return
    const data = new FormData(form)
    const empty = fields[kind].find(field => !field.optional && !String(data.get(field.name) || '').trim())
    if (empty) {
      setError(`Preencha o campo ${empty.label.toLowerCase()}.`)
      form.querySelector<HTMLElement>(`[name="${empty.name}"]`)?.focus()
      return
    }
    setError('')
    form.reset()
    setComplete(true)
    requestAnimationFrame(() => status.current?.focus())
  }

  return <form className="prototype-form" onSubmit={submit} autoComplete="off">
    <h3>{title}</h3>
    <p id={`${kind}-notice`} className="form-notice">Demonstração local. Use somente dados fictícios. Nenhuma informação será enviada ou armazenada.</p>
    {complete ? <div ref={status} className="demo-success" role="status" tabIndex={-1}>
      <ShieldCheck aria-hidden="true" />
      <h4>Simulação concluída</h4>
      <p>Os campos passaram pela validação local e foram limpos. {role ? `A candidatura para ${role} não foi enviada.` : 'Não houve envio, cadastro ou recebimento pela Antlia.'}</p>
      <button className="button signal" type="button" onClick={() => setComplete(false)}>Recomeçar simulação</button>
    </div> : <>
      {role && <dl className="application-context"><div><dt>Vaga</dt><dd>{role}</dd></div><div><dt>Senioridade</dt><dd>{level}</dd></div></dl>}
      <div className="form-grid">
        {fields[kind].map(field => <label key={field.name} className={field.wide ? 'wide' : undefined}>
          {field.label}{field.optional ? ' (opcional)' : ' *'}
          {field.type === 'textarea' ? <textarea name={field.name} rows={5} required={!field.optional} maxLength={2000} />
            : field.options ? <select name={field.name} required defaultValue=""><option value="" disabled>Selecione</option>{field.options.map(option => <option key={option}>{option}</option>)}</select>
              : <input name={field.name} type={field.type || 'text'} required={!field.optional} maxLength={field.type === 'date' ? undefined : 160} placeholder={field.type === 'email' ? 'pessoa@example.com' : undefined} />}
        </label>)}
      </div>
      {(kind === 'admission' || kind === 'individual' || kind === 'company') && <p className="form-notice">Documentos, identificadores pessoais e dados bancários não são solicitados nesta demonstração.</p>}
      {(kind === 'talent' || kind === 'application') && <p className="form-notice">Currículos e anexos não são coletados nesta fase.</p>}
      <label className="demo-consent"><input type="checkbox" required aria-describedby={`${kind}-notice`} />Estou usando dados fictícios e entendo que este fluxo é demonstrativo.</label>
      {error && <p role="alert">{error}</p>}
      <button className="button signal" type="submit">Validar simulação <ArrowRight aria-hidden="true" /></button>
    </>}
    <small><ShieldCheck aria-hidden="true" />Sem envio, persistência ou anexos.</small>
  </form>
}
