"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Check, 
  Sparkles,
  Award,
  Layers,
  Briefcase,
  MapPin,
  DollarSign,
  Clipboard,
  Download,
  ChevronRight,
  TrendingUp,
  Cpu,
  Printer
} from "lucide-react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════════════
   Types & Metadata
   ═══════════════════════════════════════════════════════════════════════ */

interface MascotInfo {
  name: string;
  tagline: string;
  color: string;
  image: string;
  welcome: string;
}

const MASCOTS: Record<string, MascotInfo> = {
  scouty: {
    name: "Scouty",
    tagline: "The Explorer",
    color: "#34D399",
    image: "/scouty.png",
    welcome: "Hey! I'm Scouty. I'm all about discovery and details. Drop your resume here, and let's dissect the structure and keywords together!",
  },
  nova: {
    name: "Nova",
    tagline: "The Visionary",
    color: "#A78BFA",
    image: "/nova.png",
    welcome: "Greetings! I'm Nova. I analyze careers with an eye for future trends. Let's scan your CV and chart your path forward.",
  },
  blaze: {
    name: "Blaze",
    tagline: "The Challenger",
    color: "#FB923C",
    image: "/blaze.png",
    welcome: "Let's get straight to it. I'm Blaze. No fluff, no sugarcoating. Drop your CV, and let's find the weak spots in your profile.",
  },
  sage: {
    name: "Sage",
    tagline: "The Mentor",
    color: "#38BDF8",
    image: "/sage.png",
    welcome: "Welcome, friend. I'm Sage. I seek the wisdom in your career story. Upload your CV, and let's identify your most valuable experiences.",
  },
  echo: {
    name: "Echo",
    tagline: "The Empath",
    color: "#F472B6",
    image: "/echo.png",
    welcome: "Hi! I'm Echo. I believe your CV is the story of your hard work. Let's look over your achievements and polish your narrative.",
  },
};

interface JobOffer {
  id: string;
  role: string;
  company: string;
  location: string;
  salary: string;
  logoColor: string;
  desc: string;
  duties: string[];
  requirements: string[];
  learningPaths?: { skill: string; platform: string; title: string; link: string }[];
}

const DEFAULT_EMPTY_JOB: JobOffer = {
  id: "empty",
  role: "No job matched",
  company: "None",
  location: "N/A",
  salary: "N/A",
  logoColor: "#7B6EF6",
  desc: "No job matches found.",
  duties: [],
  requirements: [],
  learningPaths: [],
};

const FLOATING_KEYWORDS = [
  "TypeScript", "React", "Node.js", "System Design", "UI/UX Design",
  "ATS Optimization", "SQL DB", "Cloud Architect", "Project Lead", "Next.js",
  "Python API", "CI/CD Pipeline", "Agile Flow", "RESTful API", "DevOps"
];

/* ═══════════════════════════════════════════════════════════════════════
   Helper: Typewriter Hook/Component
   ═══════════════════════════════════════════════════════════════════════ */

function TypewriterText({ text, speed = 15 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return <span>{displayedText}</span>;
}

/* ═══════════════════════════════════════════════════════════════════════
   Main Client Component
   ═══════════════════════════════════════════════════════════════════════ */

export default function AnalyzeClient({ mascotId }: { mascotId: string }) {
  const mascot = useMemo(() => MASCOTS[mascotId] || MASCOTS.nova, [mascotId]);

  /* State Management */
  const [view, setView] = useState<'upload' | 'scanning' | 'results' | 'jobs' | 'letter' | 'rework' | 'reworking'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  
  /* Log sequence state for CV scanning & cover letter compiling */
  const [logs, setLogs] = useState<string[]>([]);
  const [letterLogs, setLetterLogs] = useState<string[]>([]);
  const [reworkLogs, setReworkLogs] = useState<string[]>([]);
  const [reworkedCv, setReworkedCv] = useState<string>("");
  const [cvCopied, setCvCopied] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);
  const letterLogEndRef = useRef<HTMLDivElement>(null);
  const reworkLogEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* API Response States */
  const [atsData, setAtsData] = useState<{
    score: number;
    parsing: number;
    quality: number;
    atsCompatibility: number;
    feedback: string[];
    skills: string[];
    candidateName: string;
    email?: string;
    phone?: string;
    experience?: number;
    level?: string;
    detailedMetrics?: { label: string; value: number; description: string }[];
    llmFeedback?: { strengths: string[]; weaknesses: string[] };
  } | null>(null);
  const [jobsList, setJobsList] = useState<JobOffer[]>([]);
  const [generatedLetter, setGeneratedLetter] = useState<string>("");

  /* Jobs & Cover Letter States */
  const [selectedJob, setSelectedJob] = useState<JobOffer>(DEFAULT_EMPTY_JOB);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [copied, setCopied] = useState(false);

  /* Clean Candidate Name Extracted from File Object */
  const candidateName = useMemo(() => {
    if (atsData?.candidateName && atsData.candidateName !== "Candidat" && atsData.candidateName !== "Unknown User") {
      return atsData.candidateName;
    }
    if (!file) return "Candidate";
    let baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    baseName = baseName.replace(/[_\-\+]/g, ' ');
    baseName = baseName.replace(/\b(resume|cv|pdf|docx|txt|doc|portfolio|final|version|202\d|199\d)\b/gi, '');
    baseName = baseName.trim().replace(/\s+/g, ' ');
    if (!baseName) return "Candidate";
    return baseName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }, [file, atsData]);

  /* File Size formatting */
  const fileSizeStr = useMemo(() => {
    if (!file) return "";
    const sizeInKB = file.size / 1024;
    if (sizeInKB > 1024) return `${(sizeInKB / 1024).toFixed(1)} MB`;
    return `${sizeInKB.toFixed(0)} KB`;
  }, [file]);

  /* Get base URL dynamically */
  const getApiBaseUrl = useCallback(() => {
    if (typeof window !== "undefined") {
      if (window.location.port === "3000") {
        return "http://localhost:8000";
      }
      return window.location.origin;
    }
    return "http://localhost:8000";
  }, []);

  /* Cover Letter text generated dynamically */
  const coverLetterText = useMemo(() => {
    if (generatedLetter) return generatedLetter;
    if (!file) return "";
    const dateStr = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    let customBullets = "";
    if (selectedJob.id === "frontend") {
      customBullets = `- Expertly crafting responsive user interfaces using TypeScript, React 19, and Tailwind CSS.
- Implementing fluid motion and animations with Framer Motion, matching premium design standards.
- Optimizing rendering speeds, improving LCP and CLS scores for large-scale web applications.`;
    } else if (selectedJob.id === "fullstack") {
      customBullets = `- Developing secure, high-throughput backend APIs with Node.js and Express.
- Building complex SQL database schemas, query indexes, and scaling structures with PostgreSQL.
- Bridging the stack by styling elegant, interactive web dashboards in modular React.`;
    } else {
      customBullets = `- Architecting enterprise monorepos (using Nx and Turborepo) and setting technical standards.
- Establishing automated CI/CD deployment pipelines and testing patterns on AWS/GCP.
- Guiding engineering teams on clean coding practices and micro-frontend integrations.`;
    }

    return `${candidateName}
Candidate Profile
Email: ${atsData?.email || "contact@cvision.ai"} | Phone: ${atsData?.phone || "+1 (555) 019-2831"}
Date: ${dateStr}

Hiring Committee
${selectedJob.company}
Location: ${selectedJob.location}

Subject: Application for the ${selectedJob.role} Position

Dear Hiring Committee at ${selectedJob.company},

I am writing to express my enthusiastic interest in the ${selectedJob.role} position at ${selectedJob.company}. Having analyzed my qualifications and career experience, I am confident that my background in software engineering aligns perfectly with the requirements and technical challenges outlined for this role.

In my work, I have focused on establishing clean, efficient architectures utilizing TypeScript and React—skills that are critical to ${selectedJob.company}'s engineering objectives. My experience includes:
${customBullets}

I am particularly excited about ${selectedJob.company}'s focus on innovation. Your mission to:
"${selectedJob.desc}"
aligns with my passion for building high-quality, developer-centric systems.

Thank you for your time and consideration. I welcome the opportunity to discuss my application further in an interview.

Sincerely,

${candidateName}`;
  }, [candidateName, selectedJob, file, generatedLetter, atsData]);

  /* Speech Dialog text selector */
  const speechText = useMemo(() => {
    if (view === 'scanning') {
      return `Hold on! I am active scanning your resume details. Parsing sections, checking density, and calculating score logs.`;
    }
    if (view === 'results') {
      return `All done! I finished reviewing your document. Overall, the presentation looks solid, but we have areas to polish. Check the analysis card!`;
    }
    if (view === 'jobs') {
      return `I found some positions matching your skills. Look over their requirements on the right, and pick one to generate a custom motivation letter.`;
    }
    if (view === 'letter') {
      if (generatingLetter) {
        return `Drafting the cover letter now... I am mapping your CV highlights directly to ${selectedJob.company}'s job criteria. Just a moment!`;
      }
      return `Here is your customized cover letter! It is tailored to ${selectedJob.company} and written in a professional tone. You can copy it or download a copy.`;
    }
    if (view === 'reworking') {
      return `I am rewriting your CV to correct weaknesses, inject powerful action verbs, and structure it for maximum ATS performance. Just a moment!`;
    }
    if (view === 'rework') {
      return `Here is your fully optimized, premium CV! I've rewritten the text to highlight quantified achievements and ensure perfect ATS parsing. You can copy the markdown or download it below.`;
    }
    return mascot.welcome;
  }, [view, generatingLetter, selectedJob, mascot]);

  /* Auto-scroll log consoles */
  useEffect(() => {
    if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    if (letterLogEndRef.current) letterLogEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [letterLogs]);

  useEffect(() => {
    if (reworkLogEndRef.current) reworkLogEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [reworkLogs]);

  /* Real API CV scanning & Job matching */
  const startFileProcessing = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setView('scanning');
    
    setLogs([
      `[SYSTEM] Connecting parser sandboxed engine...`,
      `[SYSTEM] Connection secure. Uploading "${uploadedFile.name}"...`
    ]);

    try {
      const apiBaseUrl = getApiBaseUrl();
      const formData = new FormData();
      formData.append('file', uploadedFile);

      setLogs(prev => [...prev, `[SYSTEM] Analyzing ATS scores and CV structure...`]);
      
      const scoreRes = await fetch(`${apiBaseUrl}/analyze-scores`, {
        method: 'POST',
        body: formData,
      });

      if (!scoreRes.ok) throw new Error("ATS score calculation failed");
      const scoreData = await scoreRes.json();

      setLogs(prev => [
        ...prev,
        `[PARSER] Opening document successfully...`,
        `[PARSER] Detected Candidate: ${scoreData.cv_profile?.nom || "Unknown"}`,
        `[PARSER] Experience: ${scoreData.cv_profile?.annees_experience || 0} years (${scoreData.cv_profile?.niveau || "Junior"})`,
        `[KEYWORDS] Analyzing keyword weights... Detected ${scoreData.skills?.length || 0} match skills.`,
        `[ATS-SCORE] Grade compiled: Total score is ${scoreData.ats?.score || 0}%`,
        `[SYSTEM] Fetching matching job positions from database...`
      ]);

      const matchRes = await fetch(`${apiBaseUrl}/match-jobs?source=api&top_n=5`, {
        method: 'POST',
        body: formData,
      });

      let matchedJobs: JobOffer[] = [];
      if (matchRes.ok) {
        const matchData = await matchRes.json();
        const colors = ['#7B6EF6', '#34D399', '#FB923C', '#38BDF8', '#F472B6'];
        
        if (matchData.matches && matchData.matches.length > 0) {
          matchedJobs = matchData.matches.map((m: any, idx: number) => ({
            id: idx.toString(),
            role: m.titre_poste,
            company: m.entreprise,
            location: m.location || "Remote",
            salary: m.salary_min ? `${m.salary_min.toLocaleString()}€ - ${m.salary_max ? m.salary_max.toLocaleString() : 'N/A'}€` : "Competitive",
            logoColor: colors[idx % colors.length],
            desc: `This role matches your profile with a similarity of ${(m.score * 100).toFixed(0)}%. Key skills in common: ${m.top_skills_match.slice(0, 4).join(', ')}.`,
            duties: m.top_skills_match.map((s: string) => `Apply your deep skillset in ${s} to build core products.`) || [],
            requirements: m.competences_manquantes.map((s: string) => `Acquiring competence in ${s} is highly recommended for this role.`) || [],
            learningPaths: matchData.learning_paths?.filter((lp: any) => m.competences_manquantes.includes(lp.skill)) || []
          }));
          setLogs(prev => [...prev, `[SYSTEM] Found ${matchedJobs.length} matching jobs.`]);
        }
      }

      setAtsData({
        score: scoreData.ats?.score || 0,
        parsing: scoreData.ats?.details?.parsing || 0,
        quality: scoreData.ats?.details?.quality || 0,
        atsCompatibility: scoreData.ats?.details?.ats_compatibility || 0,
        feedback: scoreData.ats?.feedback || [],
        skills: scoreData.skills || [],
        candidateName: scoreData.cv_profile?.nom || "Candidat",
        email: scoreData.cv_profile?.email,
        phone: scoreData.cv_profile?.telephone,
        experience: scoreData.cv_profile?.annees_experience,
        level: scoreData.cv_profile?.niveau,
        detailedMetrics: scoreData.ats?.detailed_metrics || [],
        llmFeedback: scoreData.llm_feedback || { strengths: [], weaknesses: [] },
      });

      if (matchedJobs.length > 0) {
        setJobsList(matchedJobs);
        setSelectedJob(matchedJobs[0]);
      } else {
        setJobsList([]);
        setSelectedJob(DEFAULT_EMPTY_JOB);
      }

      setLogs(prev => [
        ...prev,
        `[SYSTEM] Compiling results card...`,
        `[SYSTEM] Process finished successfully.`
      ]);

      setTimeout(() => {
        setView('results');
      }, 650);

    } catch (err: any) {
      console.error(err);
      setLogs(prev => [...prev, `[ERROR] Analysis failed: ${err.message || err}`]);
      alert("Failed to analyze resume. Please make sure the backend FastAPI server is running on port 8000.");
      setView('upload');
    }
  };

  /* Real API Cover Letter compilation */
  const handleGenerateLetter = async () => {
    setView('letter');
    setGeneratingLetter(true);
    
    setLetterLogs([
      `[AI-WRITER] Initializing cover letter compiler...`,
      `[AI-WRITER] Tailoring letter content for ${selectedJob.company}...`
    ]);

    try {
      const apiBaseUrl = getApiBaseUrl();
      const formData = new FormData();
      formData.append('file', file!);
      formData.append('job_title', selectedJob.role);

      setLetterLogs(prev => [...prev, `[AI-WRITER] Matching highlights to ${selectedJob.role} role...`]);

      const res = await fetch(`${apiBaseUrl}/generate-cover-letter`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to generate cover letter");
      const letterData = await res.json();

      setLetterLogs(prev => [
        ...prev,
        `[AI-WRITER] Letter text generated successfully.`,
        `[SYSTEM] Compiling motivation letter paper...`,
        `[SYSTEM] Completed successfully!`
      ]);

      setGeneratedLetter(letterData.lettre_motivation || "");

      setTimeout(() => {
        setGeneratingLetter(false);
      }, 600);

    } catch (err: any) {
      console.error(err);
      setLetterLogs(prev => [...prev, `[ERROR] Generation failed: ${err.message || err}`]);
      alert("Failed to generate cover letter. Please check backend LLM availability.");
      setView('jobs');
    }
  };

  /* Drag & Drop Handlers */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const validExtensions = [".pdf", ".doc", ".docx", ".txt"];
      const isExtensionValid = validExtensions.some(ext => droppedFile.name.toLowerCase().endsWith(ext));
      if (isExtensionValid) {
        startFileProcessing(droppedFile);
      } else {
        alert("Please drop a valid file type (.pdf, .docx, .doc, .txt)");
      }
    }
  };

  /* File Selection Input Change */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      startFileProcessing(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /* Reset Analysis */
  const handleReset = () => {
    setFile(null);
    setView('upload');
    setLogs([]);
    setLetterLogs([]);
    setGeneratedLetter("");
    setAtsData(null);
    setReworkedCv("");
    setReworkLogs([]);
    setCvCopied(false);
  };

  /* Copy Letter Text */
  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* Download Letter text file */
  const handleDownload = () => {
    const blob = new Blob([coverLetterText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Cover_Letter_${selectedJob.company.replace(/\s+/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  /* Rework CV Action */
  const handleReworkCv = async () => {
    if (!file) return;
    setView('reworking');
    setReworkLogs([
      `[SYSTEM] Connecting to CV Rewriting Agent...`,
      `[SYSTEM] Connection secure. Analyzing feedback areas...`
    ]);

    const logTimeline = [
      `[AI-WRITER] Reviewing structure & contact information...`,
      `[AI-WRITER] Rephrasing experience headers using strong action verbs...`,
      `[AI-WRITER] Formulating achievements with quantified metrics...`,
      `[AI-WRITER] Adjusting skills alignment and keyword density...`,
      `[AI-WRITER] Finalizing professional markdown styling...`
    ];

    let logIdx = 0;
    const logInterval = setInterval(() => {
      if (logIdx < logTimeline.length) {
        setReworkLogs(prev => [...prev, logTimeline[logIdx]]);
        logIdx++;
      } else {
        clearInterval(logInterval);
      }
    }, 1000);

    try {
      const apiBaseUrl = getApiBaseUrl();
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${apiBaseUrl}/rework-cv`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to optimize CV");
      const data = await res.json();

      clearInterval(logInterval);
      setReworkLogs(prev => [
        ...prev,
        `[SYSTEM] CV optimized successfully!`,
        `[SYSTEM] Rendering final document...`
      ]);

      setReworkedCv(data.reworked_cv || "");

      setTimeout(() => {
        setView('rework');
      }, 800);

    } catch (err: any) {
      clearInterval(logInterval);
      console.error(err);
      setReworkLogs(prev => [...prev, `[ERROR] Rework failed: ${err.message || err}`]);
      alert("Failed to optimize CV. Please make sure the backend server and Groq API are available.");
      setView('results');
    }
  };

  /* Copy Reworked CV Markdown */
  const handleCopyReworkedCv = () => {
    navigator.clipboard.writeText(reworkedCv);
    setCvCopied(true);
    setTimeout(() => setCvCopied(false), 2000);
  };

  /* Download Reworked CV Text File */
  const handleDownloadReworkedCv = () => {
    // Strip markdown formatting for a clean plain text file
    const cleanText = reworkedCv
      .replace(/#+\s+/g, "") // Remove markdown headers
      .replace(/\*\*/g, "") // Remove bold tags
      .replace(/\*/g, "-") // Convert bullet points to standard dashes
      .trim();

    const blob = new Blob([cleanText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Optimized_CV_${candidateName.replace(/\s+/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  /* Print/Save Reworked CV to PDF */
  const handlePrintReworkedCv = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Split markdown lines and render basic printable resume format
    const lines = reworkedCv.split('\n');
    let htmlContent = "";
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) {
        htmlContent += `<h1>${trimmed.replace('# ', '')}</h1>`;
      } else if (trimmed.startsWith('## ')) {
        htmlContent += `<h2>${trimmed.replace('## ', '')}</h2>`;
      } else if (trimmed.startsWith('### ')) {
        htmlContent += `<h3>${trimmed.replace('### ', '')}</h3>`;
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const bulletText = trimmed.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        htmlContent += `<li class="bullet">${bulletText}</li>`;
      } else if (trimmed === '---') {
        htmlContent += `<hr />`;
      } else if (trimmed) {
        const pText = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        htmlContent += `<p>${pText}</p>`;
      }
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Optimized CV - ${candidateName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body {
              font-family: 'Inter', -apple-system, sans-serif;
              color: #1f2937;
              line-height: 1.5;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 {
              font-size: 26px;
              font-weight: 700;
              text-align: center;
              margin-bottom: 5px;
              color: #111827;
            }
            p {
              font-size: 13px;
              margin: 6px 0;
              color: #374151;
            }
            /* Style first paragraph under h1 as subtitle (e.g. contact info) */
            h1 + p {
              text-align: center;
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 25px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 12px;
            }
            h2 {
              font-size: 15px;
              font-weight: 700;
              color: #3b82f6;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-top: 25px;
              margin-bottom: 10px;
              border-bottom: 1.5px solid #3b82f6;
              padding-bottom: 3px;
            }
            h3 {
              font-size: 13px;
              font-weight: 600;
              margin-top: 15px;
              margin-bottom: 5px;
              color: #111827;
            }
            .bullet {
              font-size: 13px;
              margin-bottom: 4px;
              color: #374151;
              list-style-type: square;
              margin-left: 20px;
            }
            hr {
              border: 0;
              border-top: 1px solid #e5e7eb;
              margin: 20px 0;
            }
            @media print {
              body {
                padding: 0;
                color: #000;
              }
              h2 {
                border-bottom-color: #000;
                color: #000;
              }
            }
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const renderBoldPhrases = (text: string) => {
    const parts = text.split('**');
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="text-white font-semibold">{part}</strong>;
      }
      return part;
    });
  };

  /* Simple markdown renderer for CV sections */
  const renderMarkdownCV = useCallback((mdText: string) => {
    if (!mdText) return null;
    const lines = mdText.split('\n');
    return (
      <div className="space-y-3 font-sans select-text text-left">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('# ')) {
            return <h1 key={idx} className="text-lg font-extrabold text-white border-b border-white/10 pb-1.5 mt-5 mb-3">{trimmed.replace('# ', '')}</h1>;
          }
          if (trimmed.startsWith('## ')) {
            return <h2 key={idx} className="text-sm font-bold text-[#7B6EF6] uppercase tracking-wider mt-4 mb-2">{trimmed.replace('## ', '')}</h2>;
          }
          if (trimmed.startsWith('### ')) {
            return <h3 key={idx} className="text-xs font-semibold text-white/95 mt-3 mb-1">{trimmed.replace('### ', '')}</h3>;
          }
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const bulletText = trimmed.substring(2);
            return (
              <li key={idx} className="text-xs text-white/70 list-disc ml-4 pl-1 leading-relaxed mb-1">
                {renderBoldPhrases(bulletText)}
              </li>
            );
          }
          if (trimmed === '---') {
            return <hr key={idx} className="border-t border-white/5 my-3" />;
          }
          if (trimmed) {
            return <p key={idx} className="text-xs text-white/60 leading-relaxed mb-2">{renderBoldPhrases(trimmed)}</p>;
          }
          return <div key={idx} className="h-1.5" />;
        })}
      </div>
    );
  }, []);

  /* ═══════════════════════════════════════════════════════════════════════
     Dynamic ATS score breakdown and metrics calculations
     ═══════════════════════════════════════════════════════════════════════ */
  
  const score = atsData?.score || 0;

  const metrics = useMemo(() => {
    if (!atsData || !atsData.detailedMetrics || atsData.detailedMetrics.length === 0) {
      return [
        { label: "Impact & Phrasing", value: 0 },
        { label: "Formatting & Structure", value: 0 },
        { label: "Keyword Alignment", value: 0 },
        { label: "Readability Rating", value: 0 }
      ];
    }
    return atsData.detailedMetrics;
  }, [atsData]);

  const strengths = useMemo(() => {
    if (!atsData || !atsData.llmFeedback?.strengths || atsData.llmFeedback.strengths.length === 0) {
      return ["Analyzing CV data to identify strengths..."];
    }
    return atsData.llmFeedback.strengths;
  }, [atsData]);

  const weaknesses = useMemo(() => {
    if (!atsData || !atsData.llmFeedback?.weaknesses || atsData.llmFeedback.weaknesses.length === 0) {
      return ["Analyzing CV data to identify areas for optimization..."];
    }
    return atsData.llmFeedback.weaknesses;
  }, [atsData]);

  const displayJobs = useMemo(() => {
    return jobsList;
  }, [jobsList]);

  // Helper to format strengths/weaknesses beautifully by splitting at the colon and removing any markdown asterisks
  const renderFormattedFeedback = useCallback((text: string) => {
    // Remove any accidental markdown/asterisks
    const cleanText = text.replace(/\*\*/g, "").trim();
    const colonIndex = cleanText.indexOf(":");
    if (colonIndex !== -1) {
      const category = cleanText.slice(0, colonIndex).trim();
      const explanation = cleanText.slice(colonIndex + 1).trim();
      return (
        <span>
          <strong className="text-white font-semibold">{category}:</strong> {explanation}
        </span>
      );
    }
    return <span>{cleanText}</span>;
  }, []);


  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-[#07070A] overflow-y-auto overflow-x-hidden text-[#F4F4F6] relative">
      
      {/* Dynamic Background Atmospheric Radial Glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none -z-20"
        animate={{
          background: `radial-gradient(circle at 50% 30%, ${mascot.color}0B 0%, transparent 65%)`
        }}
        transition={{ duration: 1.2 }}
      />
      
      {/* Grid Dot Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015] -z-20"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Floating Decorative Blur Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div
          animate={{ y: [-10, 10, -10], x: [-5, 5, -5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute rounded-full opacity-10 blur-[60px]"
          style={{ left: "15%", top: "20%", width: "220px", height: "220px", backgroundColor: mascot.color }}
        />
        <motion.div
          animate={{ y: [10, -10, 10], x: [5, -5, 5] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute rounded-full opacity-10 blur-[80px]"
          style={{ right: "10%", bottom: "15%", width: "300px", height: "300px", backgroundColor: mascot.color }}
        />
      </div>

      {/* ── Minimalist Navigation Header ── */}
      <header className="w-full h-[72px] px-6 sm:px-10 lg:px-16 flex items-center justify-between border-b border-white/[0.04] bg-[#07070A]/85 backdrop-blur-md z-40 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display font-bold text-[17px] tracking-[-0.02em] bg-clip-text text-transparent bg-gradient-to-r from-[#7B6EF6] via-[#C084FC] to-[#F59E42]">
            CVision
          </span>
          <span className="text-[10px] font-semibold tracking-[0.06em] px-2 py-0.5 rounded-full border border-violet-500/30 bg-violet-500/8 text-violet-400 select-none">
            AI
          </span>
        </Link>
        <button 
          onClick={view === 'jobs' ? () => setView('results') : view === 'letter' ? () => setView('jobs') : undefined}
          className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/50 hover:text-white transition-colors cursor-pointer ${
            view === 'upload' || view === 'scanning' || view === 'results' ? 'pointer-events-none opacity-0' : ''
          }`}
        >
          <ArrowLeft size={14} />
          {view === 'letter' ? 'Back to Jobs' : 'Back to Report'}
        </button>
      </header>

      {/* ── Main Layout Container ── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 md:py-12 flex flex-col justify-center items-center z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 w-full items-center">
          
          {/* LEFT SIDE: MASCOT SPOTLIGHT AND DIALOGUE bubble (fades on certain states if needed, but fits side-by-side) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center relative w-full h-[220px] sm:h-[280px] md:h-[350px]">
              
              {/* Glow Behind Mascot */}
              <motion.div
                animate={{
                  scale: view === 'scanning' || (view === 'letter' && generatingLetter) ? [1.3, 1.6, 1.3] : 1.3,
                  opacity: view === 'scanning' || (view === 'letter' && generatingLetter) ? [0.25, 0.45, 0.25] : 0.25
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-[220px] md:w-[280px] h-[220px] md:h-[280px] rounded-full -z-10 blur-[50px]"
                style={{
                  background: `radial-gradient(circle at center, ${mascot.color} 0%, transparent 70%)`
                }}
              />

              {/* Floating Mascot */}
              <motion.div
                animate={view === 'scanning' || (view === 'letter' && generatingLetter) ? {
                  y: [0, -8, 6, -6, 0],
                  rotate: [0, -2, 1.5, -1.5, 0],
                  scale: [1, 1.03, 0.98, 1.02, 1],
                } : {
                  y: [0, -12, 0]
                }}
                transition={view === 'scanning' || (view === 'letter' && generatingLetter) ? {
                  duration: 0.9,
                  repeat: Infinity,
                  ease: "easeInOut"
                } : {
                  duration: 5.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative select-none flex items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mascot.image}
                  alt={mascot.name}
                  className="h-[180px] sm:h-[240px] md:h-[320px] w-auto object-contain drop-shadow-[0_12px_35px_rgba(0,0,0,0.65)]"
                  draggable={false}
                />

                {/* Scanning sweep laser overlay */}
                {(view === 'scanning' || (view === 'letter' && generatingLetter)) && (
                  <motion.div
                    className="absolute left-0 w-full h-[4px] pointer-events-none z-30"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${mascot.color}, transparent)`,
                      boxShadow: `0 0 20px 4px ${mascot.color}`,
                    }}
                    animate={{
                      top: ["10%", "90%", "10%"],
                    }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
              </motion.div>
            </div>

            {/* Bubble Dialogue Box */}
            <div className="relative mt-2 w-full max-w-sm">
              <div
                className="p-4 sm:p-5 rounded-2xl border bg-[#0F0F16]/50 backdrop-blur-md relative"
                style={{
                  borderColor: `${mascot.color}20`,
                  boxShadow: `0 10px 30px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.03)`
                }}
              >
                <div
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-t border-l bg-[#0F0F16]"
                  style={{ borderColor: `${mascot.color}20` }}
                />
                <div className="text-center font-mono text-[9px] uppercase tracking-[0.2em] mb-1" style={{ color: mascot.color }}>
                  {view === 'scanning' ? "AI SCAN ACTIVE" : view === 'letter' && generatingLetter ? "COMPILING COVER LETTER" : view === 'results' ? "Mascot verdict" : mascot.name}
                </div>
                <div className="text-white/80 text-xs leading-relaxed text-center min-h-[48px] flex items-center justify-center font-medium font-sans">
                  <TypewriterText text={speechText} />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: PHASE CARD VIEWS */}
          <div className="lg:col-span-8 w-full flex flex-col justify-center items-center">
            <AnimatePresence mode="wait">
              
              {/* VIEW 1: UPLOAD AREA */}
              {view === 'upload' && (
                <motion.div
                  key="upload-zone"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="w-full max-w-2xl"
                >
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={triggerFileInput}
                    className={`w-full py-16 sm:py-20 px-6 sm:px-12 rounded-3xl border border-dashed text-center cursor-pointer transition-all duration-500 relative flex flex-col items-center justify-center group ${
                      isDragActive ? "scale-[1.01] bg-white/[0.03]" : "bg-white/[0.01] hover:bg-white/[0.02]"
                    }`}
                    style={{
                      borderColor: isDragActive ? mascot.color : "rgba(255,255,255,0.12)",
                      boxShadow: isDragActive 
                        ? `0 0 50px ${mascot.color}18, inset 0 0 0 1px ${mascot.color}08`
                        : `0 12px 40px rgba(0,0,0,0.4)`,
                    }}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                    />
                    
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border"
                      style={{ backgroundColor: `${mascot.color}0A`, borderColor: `${mascot.color}20` }}
                    >
                      <UploadCloud size={28} className="transition-transform duration-300 group-hover:-translate-y-1" style={{ color: mascot.color }} />
                    </div>
                    
                    <h3 className="text-xl font-bold text-white/90 mb-2 font-sans tracking-wide">
                      Drop your resume here
                    </h3>
                    <p className="text-sm text-white/45 max-w-sm mb-6 leading-relaxed">
                      Drag and drop your file or <span className="font-semibold" style={{ color: mascot.color }}>browse files</span> to start the analysis
                    </p>
                    
                    <div className="text-[10px] uppercase font-mono tracking-widest text-white/20 border-t border-white/[0.04] pt-5 w-full max-w-[280px]">
                      Supports PDF, DOCX, DOC, TXT
                    </div>
                  </div>
                </motion.div>
              )}

              {/* VIEW 2: CV SCANNING SCREEN */}
              {view === 'scanning' && (
                <motion.div
                  key="scan-terminal"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="w-full max-w-2xl relative"
                >
                  {/* Floating Keyword Particle tags */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden z-25">
                    {FLOATING_KEYWORDS.map((kw, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ x: "90%", y: `${25 + idx * 4.5}%`, opacity: 0, scale: 0.6, filter: "blur(4px)" }}
                        animate={{ 
                          x: ["90%", "0%"],
                          y: [
                            `${25 + idx * 4.5}%`, 
                            `${15 + idx * 4.5 + Math.sin(idx) * 40}%`, 
                            `${25 + idx * 4.5 + Math.cos(idx) * 30}%`
                          ],
                          opacity: [0, 0.85, 0.85, 0],
                          scale: [0.7, 1.1, 0.9, 0.6],
                          filter: ["blur(2px)", "blur(0px)", "blur(0px)", "blur(3px)"]
                        }}
                        transition={{ duration: 2.8, delay: idx * 0.25, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute px-3 py-1.5 rounded-full text-[10px] font-mono border backdrop-blur-md whitespace-nowrap"
                        style={{
                          color: mascot.color,
                          borderColor: `${mascot.color}30`,
                          backgroundColor: `${mascot.color}0D`,
                          boxShadow: `0 0 10px ${mascot.color}10`
                        }}
                      >
                        {kw}
                      </motion.div>
                    ))}
                  </div>

                  <div 
                    className="w-full p-6 sm:p-8 rounded-3xl border bg-[#0C0C12]/80 backdrop-blur-md border-white/[0.06] relative"
                    style={{ boxShadow: `0 12px 40px rgba(0,0,0,0.5)` }}
                  >
                    <div className="flex items-center gap-4 border-b border-white/[0.04] pb-6 mb-6">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ backgroundColor: `${mascot.color}08`, borderColor: `${mascot.color}18` }}>
                        <FileText size={22} style={{ color: mascot.color }} />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold text-white/90 truncate max-w-[220px] sm:max-w-[320px]">
                          {file?.name}
                        </div>
                        <div className="text-xs text-white/40 font-mono">
                          {fileSizeStr} • Parsing document content
                        </div>
                      </div>
                    </div>

                    <div className="relative h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden mb-6">
                      <motion.div 
                        className="absolute h-full rounded-full"
                        style={{ backgroundColor: mascot.color, boxShadow: `0 0 12px ${mascot.color}` }}
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 4.5, ease: "linear" }}
                      />
                    </div>

                    <div className="bg-[#050508]/90 border border-white/[0.04] rounded-xl p-4 font-mono text-[10.5px] text-white/60 h-[170px] flex flex-col justify-start overflow-y-auto leading-relaxed text-left">
                      <AnimatePresence>
                        {logs.map((log, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`mb-1.5 flex items-start ${index === logs.length - 1 ? "text-white" : ""}`}
                          >
                            <span className="mr-2 select-none" style={{ color: index === logs.length - 1 ? mascot.color : "rgba(255,255,255,0.2)" }}>&gt;</span>
                            <span>{log}</span>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      <div ref={logEndRef} />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* VIEW 3: ATS METRIC RESULTS */}
              {view === 'results' && (
                <motion.div
                  key="results-panel"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="w-full max-w-2xl"
                >
                  <div 
                    className="w-full p-6 sm:p-8 rounded-3xl border bg-[#0C0C12]/50 backdrop-blur-md border-white/[0.06] relative"
                    style={{ boxShadow: `0 12px 40px rgba(0,0,0,0.5)` }}
                  >
                    <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 border-b border-white/[0.04] pb-6 mb-6">
                      
                      {/* circular Gauge */}
                      <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
                          <motion.circle
                            cx="50"
                            cy="50"
                            r="42"
                            stroke={mascot.color}
                            strokeWidth="6"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 42}
                            initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 42 - (score / 100) * (2 * Math.PI * 42) }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute text-center">
                          <span className="text-2xl font-bold text-white tracking-tight">{score}%</span>
                          <p className="text-[8px] uppercase tracking-wider text-white/30 font-semibold font-mono">ATS Match</p>
                        </div>
                      </div>

                      {/* critique Rating */}
                      <div className="text-center sm:text-left flex-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase border mb-2.5"
                             style={{ color: mascot.color, borderColor: `${mascot.color}30`, backgroundColor: `${mascot.color}0D` }}
                        >
                          <Sparkles size={10} />
                          {atsData ? `${atsData.level} Profile` : "Strong Evaluation"}
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2 leading-tight">
                          {atsData ? atsData.candidateName : "CV Analysis Assessment"}
                        </h4>

                        {/* Candidate Information Card */}
                        {atsData && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-white/55 font-mono mb-4 border border-white/[0.04] bg-white/[0.005] rounded-xl p-3 max-w-md">
                            {atsData.email && (
                              <div className="truncate flex items-center gap-1">
                                <span className="text-white/25">EMAIL:</span>
                                <span className="text-white/80">{atsData.email}</span>
                              </div>
                            )}
                            {atsData.phone && (
                              <div className="truncate flex items-center gap-1">
                                <span className="text-white/25">PHONE:</span>
                                <span className="text-white/80">{atsData.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <span className="text-white/25">EXPERIENCE:</span>
                              <span className="text-white/80">{atsData.experience ?? 0} {atsData.experience === 1 ? 'year' : 'years'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-white/25">LEVEL:</span>
                              <span className="text-white/80">{atsData.level || 'Junior'}</span>
                            </div>
                          </div>
                        )}

                        <p className="text-xs text-white/50 leading-relaxed max-w-md">
                          {atsData 
                            ? `Analysis complete for ${atsData.candidateName}. Overall score is ${atsData.score}%. ${
                                atsData.feedback.length > 0 
                                  ? `Top recommended improvement: ${atsData.feedback[0]}`
                                  : "Excellent formatting, structure, and keyword density detected!"
                              }`
                            : "Your resume demonstrates clean structure and robust experience headers. To cross the 90% threshold, focus on clarifying quantitative impact in your experience blocks."}
                        </p>
                      </div>
                    </div>

                    {/* Progress grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      {metrics.map((m, idx) => (
                        <div key={idx} className="bg-white/[0.01] border border-white/[0.03] rounded-xl p-3.5 flex flex-col justify-between">
                          <div className="flex justify-between items-center text-xs font-medium text-white/70 mb-2">
                            <span>{m.label}</span>
                            <span className="font-mono" style={{ color: mascot.color }}>{m.value}%</span>
                          </div>
                          <div className="relative h-1 w-full bg-white/[0.04] rounded-full overflow-hidden">
                            <motion.div
                              className="absolute h-full rounded-full"
                              style={{ backgroundColor: mascot.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${m.value}%` }}
                              transition={{ duration: 1.2, delay: idx * 0.1, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* strengths / weaknesses */}
                    <div className="space-y-4 mb-8">
                      <div className="border border-white/[0.03] bg-white/[0.005] rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#34D399] mb-3">
                          <Award size={14} /> Key Strengths
                        </div>
                        <ul className="space-y-2">
                          {strengths.map((str, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-white/70 leading-relaxed text-left">
                              <span className="w-4 h-4 rounded-full bg-[#34D399]/10 flex items-center justify-center shrink-0 mt-0.5 border border-[#34D399]/20">
                                <Check size={10} className="text-[#34D399]" />
                              </span>
                              <span>{renderFormattedFeedback(str)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="border border-white/[0.03] bg-white/[0.005] rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FB923C] mb-3">
                          <AlertTriangle size={14} /> Areas for Optimization
                        </div>
                        <ul className="space-y-2">
                          {weaknesses.map((weak, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-white/70 leading-relaxed text-left">
                              <span className="w-4 h-4 rounded-full bg-[#FB923C]/10 flex items-center justify-center shrink-0 mt-0.5 border border-[#FB923C]/20">
                                <AlertTriangle size={10} className="text-[#FB923C]" />
                              </span>
                              <span>{renderFormattedFeedback(weak)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Optimize CV Banner */}
                    <div className="border border-[#7B6EF6]/25 bg-[#7B6EF6]/5 rounded-2xl p-5 relative overflow-hidden mb-6 text-left">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#7B6EF6]/5 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex items-start gap-4 relative z-10">
                        <div className="w-9 h-9 rounded-xl bg-[#7B6EF6]/10 border border-[#7B6EF6]/15 flex items-center justify-center shrink-0 mt-0.5">
                          <Cpu size={18} className="text-[#A78BFA]" />
                        </div>
                        <div className="flex-1">
                          <h5 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                            AI CV Optimizer <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#7B6EF6]/15 text-[#A78BFA] font-mono font-semibold">ATS Booster</span>
                          </h5>
                          <p className="text-[11px] text-white/55 leading-relaxed mb-3">
                            Let AI rewrite and restructure your CV to fix all identified optimization areas, insert high-impact quantified achievements, and boost your ATS score to 100%.
                          </p>
                          <button
                            onClick={handleReworkCv}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold tracking-wide cursor-pointer transition-all duration-300 hover:brightness-110 active:scale-95 text-white bg-[#7B6EF6]"
                            style={{ boxShadow: "0 0 12px rgba(123, 110, 246, 0.25)" }}
                          >
                            <Sparkles size={11} />
                            Rework & Optimize My CV
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.04] pt-6">
                      <button
                        onClick={handleReset}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-xs font-semibold tracking-wide cursor-pointer transition-all duration-300 w-full sm:w-auto"
                      >
                        <RotateCcw size={12} />
                        Try Another CV
                      </button>
                      <button
                        onClick={() => setView('jobs')}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold tracking-wide cursor-pointer transition-all duration-300 w-full sm:w-auto"
                        style={{ backgroundColor: mascot.color, color: "#07070A", boxShadow: `0 0 20px ${mascot.color}40` }}
                      >
                        <Briefcase size={12} />
                        Find Matching Jobs
                      </button>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* VIEW 4: MATCHING JOBS LIST & DETAIL ACCORDION */}
              {view === 'jobs' && (
                <motion.div
                  key="jobs-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="w-full max-w-4xl"
                >
                  {displayJobs.length === 0 ? (
                    <div className="w-full text-center py-16 px-6 rounded-3xl border border-white/[0.04] bg-[#0C0C12]/45 backdrop-blur-md relative" style={{ boxShadow: `0 12px 40px rgba(0,0,0,0.5)` }}>
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border mx-auto" style={{ backgroundColor: `${mascot.color}0A`, borderColor: `${mascot.color}20` }}>
                        <Briefcase size={28} style={{ color: mascot.color }} />
                      </div>
                      <h3 className="text-xl font-bold text-white/90 mb-2 font-sans tracking-wide">
                        No Matching Positions Found
                      </h3>
                      <p className="text-sm text-white/45 max-w-md mx-auto mb-8 leading-relaxed">
                        We couldn't retrieve matching positions from the API. Please ensure that your Adzuna credentials (<code className="px-1.5 py-0.5 rounded bg-white/5 font-mono text-white/80">ADZUNA_APP_ID</code> and <code className="px-1.5 py-0.5 rounded bg-white/5 font-mono text-white/80">ADZUNA_APP_KEY</code>) are correctly set in the backend <code className="px-1.5 py-0.5 rounded bg-white/5 font-mono text-white/80">.env</code> file.
                      </p>
                      <button
                        onClick={handleReset}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold tracking-wide cursor-pointer transition-all duration-300"
                        style={{ backgroundColor: mascot.color, color: "#07070A", boxShadow: `0 0 20px ${mascot.color}40` }}
                      >
                        <RotateCcw size={12} />
                        Scan Another CV
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start w-full">
                      
                      {/* Job listings (40% width on md+) */}
                      <div className={`md:col-span-5 space-y-3.5 w-full ${mobileDetailOpen ? 'hidden md:block' : 'block'}`}>
                        <h3 className="text-md font-bold uppercase tracking-wider text-white/50 text-left mb-2.5 flex items-center gap-2">
                          <TrendingUp size={16} /> Matching Roles
                        </h3>
                        {displayJobs.map((job) => {
                          const isActive = selectedJob.id === job.id;
                          return (
                            <div
                              key={job.id}
                              onClick={() => {
                                setSelectedJob(job);
                                setMobileDetailOpen(true);
                              }}
                              className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between hover:bg-white/[0.02] ${
                                isActive 
                                  ? "bg-white/[0.03]" 
                                  : "bg-white/[0.005] border-white/[0.04]"
                              }`}
                              style={{
                                borderColor: isActive ? mascot.color : "rgba(255,255,255,0.04)",
                                boxShadow: isActive ? `0 0 25px ${mascot.color}08` : "none"
                              }}
                            >
                              {/* Accent Glow Line for Active listing */}
                              {isActive && (
                                <div className="absolute top-0 bottom-0 left-0 w-1" style={{ backgroundColor: mascot.color }} />
                              )}
                              <div className="flex justify-between items-start gap-2 mb-2">
                                <span className="text-xs font-semibold text-white/35 font-mono">{job.company}</span>
                                <span className="text-[10px] font-semibold text-[#34D399] font-mono px-2 py-0.5 rounded-md bg-[#34D399]/5 border border-[#34D399]/15">
                                  {job.salary.split(' ')[0]}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-white mb-2 leading-tight">{job.role}</h4>
                              <div className="flex items-center gap-3 text-white/45 text-[11px] font-medium mt-1">
                                <span className="flex items-center gap-1"><MapPin size={10} /> {job.location.split(' ')[0]}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Job details pane (60% width on md+) */}
                      <div className={`md:col-span-7 bg-[#0C0C12]/50 border border-white/[0.05] rounded-3xl p-6 relative w-full ${!mobileDetailOpen ? 'hidden md:block' : 'block'}`}>
                        
                        {/* Mobile back button to Listings */}
                        <button
                          onClick={() => setMobileDetailOpen(false)}
                          className="md:hidden inline-flex items-center gap-1.5 text-xs text-white/50 mb-4 hover:text-white"
                        >
                          <ArrowLeft size={12} /> Back to Listings
                        </button>

                        <div className="text-left border-b border-white/[0.04] pb-5 mb-5 relative">
                          <div className="flex items-center gap-3 mb-2.5">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm" style={{ backgroundColor: `${selectedJob.logoColor}12`, border: `1px solid ${selectedJob.logoColor}20`, color: selectedJob.logoColor }}>
                              {selectedJob.company.charAt(0)}
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-white/40 uppercase tracking-wider font-mono">{selectedJob.company}</span>
                              <h3 className="text-lg font-bold text-white leading-tight mt-0.5">{selectedJob.role}</h3>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-xs text-white/60 font-medium mt-4 pt-1">
                            <div className="flex items-center gap-2 bg-white/[0.01] border border-white/[0.03] rounded-xl p-2">
                              <MapPin size={13} style={{ color: mascot.color }} />
                              <span>{selectedJob.location}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/[0.01] border border-white/[0.03] rounded-xl p-2">
                              <DollarSign size={13} style={{ color: mascot.color }} />
                              <span className="font-mono">{selectedJob.salary}</span>
                            </div>
                          </div>
                        </div>

                        {/* Detail content blocks */}
                        <div className="text-left space-y-4 max-h-[220px] overflow-y-auto pr-1">
                          <div>
                            <h5 className="text-[10px] font-bold uppercase tracking-wider text-white/30 font-mono mb-1.5">Description</h5>
                            <p className="text-xs text-white/60 leading-relaxed">{selectedJob.desc}</p>
                          </div>
                          <div>
                            <h5 className="text-[10px] font-bold uppercase tracking-wider text-white/30 font-mono mb-1.5">Responsibilities</h5>
                            <ul className="space-y-1.5 text-xs text-white/65">
                              {selectedJob.duties.map((duty, idx) => (
                                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                                  <span className="text-white/40 mt-1 select-none">•</span>
                                  <span>{duty}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="text-[10px] font-bold uppercase tracking-wider text-white/30 font-mono mb-1.5">Requirements</h5>
                            <ul className="space-y-1.5 text-xs text-white/65">
                              {selectedJob.requirements.map((req, idx) => (
                                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                                  <span className="text-white/40 mt-1 select-none">•</span>
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Learning Paths / Course Recommendations */}
                          {selectedJob.learningPaths && selectedJob.learningPaths.length > 0 && (
                            <div className="mt-6 border border-[#34D399]/25 bg-[#34D399]/5 rounded-2xl p-4">
                              <h5 className="text-xs font-bold uppercase tracking-wider text-[#34D399] flex items-center gap-2 mb-3">
                                <Award size={14} /> Recommended Learning Paths
                              </h5>
                              <p className="text-[11px] text-[#34D399]/80 mb-3 leading-relaxed">
                                Boost your matching score by acquiring these missing skills through free courses.
                              </p>
                              <div className="space-y-3">
                                {selectedJob.learningPaths.map((lp, idx) => (
                                  <a
                                    key={idx}
                                    href={lp.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block p-3 rounded-xl border border-[#34D399]/15 bg-[#34D399]/10 hover:bg-[#34D399]/20 transition-all cursor-pointer group"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="text-[10px] uppercase font-bold text-[#34D399]/70 mb-1">{lp.skill} • {lp.platform}</div>
                                        <div className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">{lp.title}</div>
                                      </div>
                                      <div className="w-6 h-6 rounded-full bg-[#34D399]/20 flex items-center justify-center shrink-0">
                                        <TrendingUp size={12} className="text-[#34D399]" />
                                      </div>
                                    </div>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action trigger button */}
                        <div className="border-t border-white/[0.04] pt-5 mt-5 flex justify-end gap-3.5">
                          <button
                            onClick={handleGenerateLetter}
                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-semibold tracking-wide cursor-pointer transition-all duration-300"
                            style={{ backgroundColor: mascot.color, color: "#07070A", boxShadow: `0 0 20px ${mascot.color}30` }}
                          >
                            <Cpu size={12} />
                            Generate Cover Letter
                          </button>
                        </div>

                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* VIEW 5: MOTIVATION LETTER GENERATION & DOCUMENT BLOCK */}
              {view === 'letter' && (
                <motion.div
                  key="letter-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="w-full max-w-2xl"
                >
                  {/* SIMULATED AI LETTER COMPILING TERMINAL */}
                  {generatingLetter ? (
                    <div 
                      className="w-full p-6 sm:p-8 rounded-3xl border bg-[#0C0C12]/80 backdrop-blur-md border-white/[0.06] relative"
                      style={{ boxShadow: `0 12px 40px rgba(0,0,0,0.5)` }}
                    >
                      <div className="flex items-center gap-4 border-b border-white/[0.04] pb-5 mb-5">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ backgroundColor: `${mascot.color}08`, borderColor: `${mascot.color}18` }}>
                          <Cpu size={22} style={{ color: mascot.color }} />
                        </div>
                        <div className="text-left">
                          <h4 className="text-sm font-bold text-white/95">Writing Letter Template</h4>
                          <p className="text-xs text-white/40 font-mono">Tailoring letter to {selectedJob.company}</p>
                        </div>
                      </div>

                      <div className="relative h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden mb-6">
                        <motion.div 
                          className="absolute h-full rounded-full"
                          style={{ backgroundColor: mascot.color, boxShadow: `0 0 12px ${mascot.color}` }}
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 3.2, ease: "linear" }}
                        />
                      </div>

                      <div className="bg-[#050508]/90 border border-white/[0.04] rounded-xl p-4 font-mono text-[10.5px] text-white/60 h-[150px] flex flex-col justify-start overflow-y-auto leading-relaxed text-left">
                        <AnimatePresence>
                          {letterLogs.map((log, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`mb-1.5 flex items-start ${index === letterLogs.length - 1 ? "text-white" : ""}`}
                            >
                              <span className="mr-2 select-none" style={{ color: index === letterLogs.length - 1 ? mascot.color : "rgba(255,255,255,0.2)" }}>&gt;</span>
                              <span>{log}</span>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        <div ref={letterLogEndRef} />
                      </div>
                    </div>
                  ) : (
                    
                    /* COVER LETTER DOCUMENT RENDER */
                    <div 
                      className="w-full p-5 sm:p-7 rounded-3xl border bg-[#0C0C12]/55 backdrop-blur-md border-white/[0.05]"
                      style={{ boxShadow: `0 12px 40px rgba(0,0,0,0.5)` }}
                    >
                      {/* Document Toolbar */}
                      <div className="flex items-center justify-between border-b border-white/[0.04] pb-4 mb-4 gap-3">
                        <div className="flex items-center gap-2">
                          <FileText size={16} style={{ color: mascot.color }} />
                          <span className="text-xs font-semibold text-white/50 uppercase tracking-wider font-mono">Motivation_Letter.txt</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={handleCopy}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-[10px] font-bold tracking-wider uppercase cursor-pointer transition-colors duration-200"
                          >
                            {copied ? (
                              <>
                                <Check size={10} className="text-[#34D399]" />
                                <span className="text-[#34D399]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Clipboard size={10} />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={handleDownload}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-[10px] font-bold tracking-wider uppercase cursor-pointer transition-colors duration-200"
                          >
                            <Download size={10} />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>

                      {/* Letter Text Paper Card */}
                      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 sm:p-6 text-left font-mono text-[11px] text-white/80 max-h-[340px] overflow-y-auto leading-relaxed whitespace-pre-wrap select-text">
                        {coverLetterText}
                      </div>

                      {/* Bottom navigation action reset */}
                      <div className="border-t border-white/[0.04] pt-5 mt-5 flex justify-between gap-3">
                        <button
                          onClick={() => setView('jobs')}
                          className="inline-flex items-center gap-1.5 text-xs text-white/45 hover:text-white transition-colors cursor-pointer"
                        >
                          <ArrowLeft size={12} /> Back to Jobs
                        </button>
                        <button
                          onClick={handleReset}
                          className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-xs font-semibold tracking-wide cursor-pointer transition-all duration-300"
                        >
                          <RotateCcw size={12} />
                          Analyze New CV
                        </button>
                      </div>

                    </div>
                  )}
                </motion.div>
              )}

              {/* VIEW 6: CV REWORKING SCANNING SCREEN */}
              {view === 'reworking' && (
                <motion.div
                  key="reworking-terminal"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="w-full max-w-2xl relative"
                >
                  <div 
                    className="w-full p-6 sm:p-8 rounded-3xl border bg-[#0C0C12]/80 backdrop-blur-md border-white/[0.06] relative"
                    style={{ boxShadow: `0 12px 40px rgba(0,0,0,0.5)` }}
                  >
                    <div className="flex items-center gap-4 border-b border-white/[0.04] pb-5 mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ backgroundColor: `${mascot.color}08`, borderColor: `${mascot.color}18` }}>
                        <Cpu size={22} style={{ color: mascot.color }} />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-bold text-white/95">Rebuilding Document</h4>
                        <p className="text-xs text-white/40 font-mono">Optimizing for ATS Compatibility</p>
                      </div>
                    </div>

                    <div className="relative h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden mb-6">
                      <motion.div 
                        className="absolute h-full rounded-full"
                        style={{ backgroundColor: mascot.color, boxShadow: `0 0 12px ${mascot.color}` }}
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 4.8, ease: "linear" }}
                      />
                    </div>

                    <div className="bg-[#050508]/90 border border-white/[0.04] rounded-xl p-4 font-mono text-[10.5px] text-white/60 h-[150px] flex flex-col justify-start overflow-y-auto leading-relaxed text-left">
                      <AnimatePresence>
                        {reworkLogs.map((log, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`mb-1.5 flex items-start ${index === reworkLogs.length - 1 ? "text-white" : ""}`}
                          >
                            <span className="mr-2 select-none" style={{ color: index === reworkLogs.length - 1 ? mascot.color : "rgba(255,255,255,0.2)" }}>&gt;</span>
                            <span>{log}</span>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      <div ref={reworkLogEndRef} />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* VIEW 7: OPTIMIZED CV DOCUMENT VIEW */}
              {view === 'rework' && (
                <motion.div
                  key="rework-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="w-full max-w-2xl"
                >
                  <div 
                    className="w-full p-5 sm:p-7 rounded-3xl border bg-[#0C0C12]/55 backdrop-blur-md border-white/[0.05]"
                    style={{ boxShadow: `0 12px 40px rgba(0,0,0,0.5)` }}
                  >
                    {/* Document Toolbar */}
                    <div className="flex items-center justify-between border-b border-white/[0.04] pb-4 mb-4 gap-3">
                      <div className="flex items-center gap-2">
                        <FileText size={16} style={{ color: mascot.color }} />
                        <span className="text-xs font-semibold text-white/50 uppercase tracking-wider font-mono">Optimized_CV.txt</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={handleCopyReworkedCv}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-[10px] font-bold tracking-wider uppercase cursor-pointer transition-colors duration-200"
                        >
                          {cvCopied ? (
                            <>
                              <Check size={10} className="text-[#34D399]" />
                              <span className="text-[#34D399]">Copied</span>
                            </>
                          ) : (
                            <>
                              <Clipboard size={10} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={handlePrintReworkedCv}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-[10px] font-bold tracking-wider uppercase cursor-pointer transition-colors duration-200"
                        >
                          <Printer size={10} />
                          <span>PDF / Print</span>
                        </button>

                        <button
                          onClick={handleDownloadReworkedCv}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-[10px] font-bold tracking-wider uppercase cursor-pointer transition-colors duration-200"
                        >
                          <Download size={10} />
                          <span>Download TXT</span>
                        </button>
                      </div>
                    </div>

                    {/* CV Text Paper Card */}
                    <div className="bg-white/[0.01] border border-white/[0.04] rounded-xl p-5 sm:p-6 text-left max-h-[380px] overflow-y-auto leading-relaxed">
                      {renderMarkdownCV(reworkedCv)}
                    </div>

                    {/* Bottom navigation */}
                    <div className="border-t border-white/[0.04] pt-5 mt-5 flex justify-between gap-3">
                      <button
                        onClick={() => setView('results')}
                        className="inline-flex items-center gap-1.5 text-xs text-white/45 hover:text-white transition-colors cursor-pointer"
                      >
                        <ArrowLeft size={12} /> Back to Analysis
                      </button>
                      <button
                        onClick={handleReset}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-xs font-semibold tracking-wide cursor-pointer transition-all duration-300"
                      >
                        <RotateCcw size={12} />
                        Analyze New CV
                      </button>
                    </div>

                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>
      </main>

      {/* Footer copyright */}
      <footer className="w-full py-6 text-center text-[10px] text-white/15 tracking-wider uppercase font-mono z-40 shrink-0 border-t border-white/[0.02] bg-[#07070A]/50">
        © {new Date().getFullYear()} CVision AI. ALL RIGHTS RESERVED.
      </footer>

    </div>
  );
}
