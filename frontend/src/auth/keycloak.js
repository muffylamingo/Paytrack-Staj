import Keycloak from 'keycloak-js'

/*
  Keycloak istemcisi (Faz 7)
  --------------------------
  Giriş ekranını, şifre kontrolünü, "şifremi unuttum" akışını BİZ yazmıyoruz.
  Kullanıcı Keycloak'ın kendi sayfasına yönlendirilir, orada giriş yapar ve
  bize imzalı bir "token" ile geri döner.

  Bunun güvenlik avantajı: uygulamamız kullanıcının şifresini HİÇ GÖRMEZ.
  🔎 "openid connect authorization code flow", "single sign-on (SSO)"

  Ayarlar docker-compose.yml ve keycloak/paytrack-realm.json ile birebir aynı.
*/
export const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'paytrack',
  clientId: 'paytrack-frontend',
})

/* ---------------- Roller (Ekstra: yetkilendirme) ----------------
   Roller token'ın içinde "realm_access.roles" altında gelir.

   ÖNEMLİ: Buradaki kontroller sadece ARAYÜZ İÇİNDİR (kullanıcıya
   yapamayacağı düğmeyi göstermemek için). GERÇEK güvenlik backend'de
   yapılır — çünkü tarayıcıdaki JavaScript'e asla güvenilmez, kullanıcı
   onu değiştirebilir. Backend her isteği tekrar kontrol ediyor.
   🔎 "never trust the client" */
export const ROL_MUDUR = 'paytrack-mudur'
export const ROL_MUHASEBE = 'paytrack-muhasebe'
export const ROL_GORUNTULEYICI = 'paytrack-goruntuleyici'

export function rolleriAl() {
  return keycloak.tokenParsed?.realm_access?.roles ?? []
}

export function yetkiliMi(...roller) {
  const sahip = rolleriAl()
  return roller.some((r) => sahip.includes(r))
}

// Kısayollar
export const yazabilirMi = () => yetkiliMi(ROL_MUDUR, ROL_MUHASEBE)
export const yonetebilirMi = () => yetkiliMi(ROL_MUDUR)

// Token'ın süresi dolmadan yenilenmesi için kullanılır (axios araya girerken çağırır)
export async function tokenAl() {
  try {
    // Kalan süre 30 saniyeden azsa yenile
    await keycloak.updateToken(30)
  } catch {
    // Yenilenemiyorsa oturum bitmiştir -> giriş ekranına
    keycloak.login()
  }
  return keycloak.token
}
