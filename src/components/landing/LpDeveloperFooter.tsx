export function LpDeveloperFooter({ className }: { className?: string }) {
  return (
    <div className={`text-center text-xs md:text-sm text-muted-foreground ${className ?? ""}`}>
      Developed by{" "}
      <a
        href="https://wa.me/8801602867954?text=Hello%20Anwarul%20Karim%2C%20I%27d%20like%20to%20discuss%20developing%20a%20website.%20Can%20you%20help%20me%3F"
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold underline hover:text-primary transition-colors"
        aria-label="WhatsApp-এ Anwarul Karim-এর সাথে কথা বলুন"
      >
        Anwarul Karim
      </a>
    </div>
  );
}
