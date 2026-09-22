// this is going to be a link to the previous page.
import { Link } from "react-router-dom"

export default function BackButton({to, label}) {
  return <Link
    to={to}
    className="text-sm text-base-content/60 hover:text-base-content flex items-center gap-1 mb-2"
  >
    &lt; {label}
  </Link>
}