// Elemente comune pentru /login și /register.
// Culorile sunt fixe (excepție aprobată): utilizatorul nu e logat, deci nu folosim tema lui.

// Câmpurile nu urmează tema: altfel pe Dark ar deveni închise pe cardul alb.
export const authInputClass =
  "h-11 border-[#dde1e8] bg-white text-[#1b2230] placeholder:text-[#667085] dark:bg-white focus-visible:border-[#3478f6] focus-visible:ring-[#3478f6]/30";

export const authButtonClass =
  "mt-2 h-12 rounded-lg bg-[#3478F6] text-xl font-semibold text-white transition-colors hover:bg-[#2563eb] focus-visible:ring-2 focus-visible:ring-[#3478f6]/50 focus-visible:outline-none disabled:opacity-60";

// Gradientul albastru de fundal (folosit și de coperta de după login, LoginCover)
export const authGradientClass = "bg-linear-to-br from-[#5b95f9] via-[#3478f6] to-[#1e4fbf]";

// Fundalul albastru (gradient) + cardul alb centrat
export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className={`flex min-h-svh items-center justify-center px-4 ${authGradientClass}`}>
     <div className="flex w-full max-w-xl min-h-[70svh] flex-col rounded-2xl bg-white p-10 text-[#1b2230] shadow-xl">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm text-[#667085]">{subtitle}</p>
        {children}
      </div>
    </main>
  );
}

// Mesajul de eroare de sub câmpuri
export function AuthError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c]">
      {message}
    </p>
  );
}
