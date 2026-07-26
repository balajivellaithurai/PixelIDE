import {
  FiCode,
  FiFileText,
} from "react-icons/fi";
import {
  SiJavascript,
  SiPython,
  SiCplusplus,
  SiHtml5,
  SiJson,
} from "react-icons/si";
import { FaJava } from "react-icons/fa";

export default function FileIcon({ filename = "", className = "w-3.5 h-3.5" }) {
  const ext = filename.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "js":
    case "jsx":
      return <SiJavascript className={`${className} text-yellow-400 shrink-0`} />;
    case "ts":
    case "tsx":
      return <SiJavascript className={`${className} text-blue-400 shrink-0`} />;
    case "py":
      return <SiPython className={`${className} text-blue-400 shrink-0`} />;
    case "cpp":
    case "cc":
    case "cxx":
      return <SiCplusplus className={`${className} text-indigo-400 shrink-0`} />;
    case "c":
      return <FiCode className={`${className} text-blue-300 shrink-0`} />;
    case "java":
      return <FaJava className={`${className} text-amber-500 shrink-0`} />;
    case "html":
      return <SiHtml5 className={`${className} text-orange-500 shrink-0`} />;
    case "css":
      return <FiCode className={`${className} text-sky-400 shrink-0`} />;
    case "json":
      return <SiJson className={`${className} text-yellow-500 shrink-0`} />;
    default:
      return <FiFileText className={`${className} text-neutral-400 shrink-0`} />;
  }
}
