import { useState } from "react"
import { Bot, MessageSquare, Send, Sparkles, X } from "lucide-react"
import { queryAssistant } from "../services/api"
import type { Project } from "../types/api"

interface IntelligenceAssistantProps {
  isOpen: boolean
  onClose: () => void
  onSelectProject: (key: string) => void
}

interface ChatMessage {
  sender: "user" | "assistant"
  text: string
  matchedProjects?: Project[]
}

export default function IntelligenceAssistant({
  isOpen,
  onClose,
  onSelectProject,
}: IntelligenceAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "assistant",
      text: "Hello! I am the **PAIMANA Project Intelligence Assistant**. I can answer questions about the active MoSPI central infrastructure portfolio, cost overruns, delay drivers, and predictive risk rankings. Ask me anything or select a prompt below!",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const samplePrompts = [
    "Which projects have the highest risk?",
    "Which sectors have the highest cost escalation?",
    "Show projects with major schedule delays",
    "Tell me about Hajipur-Sagauli railway",
  ]

  const handleSend = (textToSend?: string) => {
    const q = textToSend || input
    if (!q.trim() || loading) return

    const userMsg: ChatMessage = { sender: "user", text: q }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    queryAssistant(q)
      .then((res) => {
        setMessages((prev) => [
          ...prev,
          {
            sender: "assistant",
            text: res.answer,
            matchedProjects: res.matched_projects,
          },
        ])
        setLoading(false)
      })
      .catch((err) => {
        setMessages((prev) => [
          ...prev,
          {
            sender: "assistant",
            text: "Sorry, I encountered an error connecting to the intelligence backend.",
          },
        ])
        setLoading(false)
      })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl border-l border-slate-200">
      {/* Drawer Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-[#0b1f3a] p-4 text-white">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Bot size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold">PAIMANA Intelligence Assistant</h2>
            <p className="text-[10px] text-slate-300">Grounded in verified MoSPI data</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                m.sender === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-slate-100 text-slate-800 rounded-bl-none shadow-sm"
              }`}
            >
              <div className="whitespace-pre-line">{m.text}</div>

              {/* Matched project cards */}
              {m.matchedProjects && m.matchedProjects.length > 0 && (
                <div className="mt-3 space-y-2 border-t border-slate-200 pt-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Referenced Projects:
                  </span>
                  {m.matchedProjects.map((proj) => (
                    <button
                      key={proj.canonical_project_key}
                      onClick={() => onSelectProject(proj.canonical_project_key)}
                      className="flex w-full items-center justify-between rounded-lg bg-white p-2 text-left text-[11px] shadow-sm hover:border-blue-500 border border-slate-200"
                    >
                      <span className="font-semibold text-slate-800 truncate pr-2">
                        {proj.project_name}
                      </span>
                      <span className="shrink-0 font-bold text-blue-600">View →</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            Analyzing portfolio facts...
          </div>
        )}
      </div>

      {/* Suggested Prompts */}
      <div className="border-t border-slate-100 bg-slate-50 p-2.5">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-1.5">
          <Sparkles size={12} className="text-amber-500" />
          <span>Suggested Questions:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {samplePrompts.map((p) => (
            <button
              key={p}
              onClick={() => handleSend(p)}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] text-slate-600 hover:border-blue-400 hover:text-blue-600 shadow-sm"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="border-t border-slate-200 p-3 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask about project risks, sectors, delays..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  )
}
