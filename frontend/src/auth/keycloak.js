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
