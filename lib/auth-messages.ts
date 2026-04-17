export function getFriendlyAuthErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) {
    return fallback;
  }

  const raw = error.message.trim();
  const normalized = raw.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "이메일 또는 비밀번호가 올바르지 않습니다. 다시 확인해주세요.";
  }

  if (normalized.includes("email not confirmed")) {
    return "이메일 인증이 완료되지 않았습니다. 가입한 메일함에서 인증 후 다시 로그인해주세요.";
  }

  if (normalized.includes("fetch failed") || normalized.includes("network")) {
    return "인증 서버에 연결하지 못했습니다. 잠시 후 다시 시도해주세요.";
  }

  if (normalized.includes("supabase public env is missing")) {
    return "로그인 설정이 아직 완료되지 않았습니다. 운영자에게 환경변수 설정 여부를 확인해주세요.";
  }

  return raw || fallback;
}
