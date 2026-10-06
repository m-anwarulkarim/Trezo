export function LpDeveloperFooter({ className }: { className?: string }) {
  return (
    <div className={`py-6 text-center text-xs md:text-sm text-slate-500 font-medium ${className ?? ""}`}>
      Developed by{" "}
      <a
        href="https://wa.me/8801602867954?text=Hello%20Anwarul%20Karim!%20I%20saw%20Trezo%20website%20and%20want%20to%20build%20a%20project."
        target="_blank"
        rel="noopener noreferrer"
        className="font-bold text-slate-700 hover:text-blue-600 underline underline-offset-4 decoration-blue-500/40 hover:decoration-blue-600 transition-colors"
        aria-label="WhatsApp-এ Anwarul Karim-এর সাথে কথা বলুন"
      >
        Anwarul Karim
      </a>
    </div>
  );
}
