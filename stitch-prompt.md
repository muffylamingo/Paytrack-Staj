# 🎨 Stitch Tasarım Prompt'ları — PayTrack

Bunları [stitch.withgoogle.com](https://stitch.withgoogle.com) adresine yapıştır. İngilizce yazıldı çünkü
Stitch İngilizce'de daha iyi sonuç veriyor. Çıkan tasarımların ekran görüntüsünü bana gönder → React kodunu ona göre yazacağım.

> İpucu: Stitch'te tek tek ekran üretmek daha temiz sonuç verir. Sırayla dene: önce **Ana Prompt**, sonra
> beğenmezsen ekran bazlı prompt'lardan git.

---

## 1) ANA PROMPT (tüm uygulamanın havası)

```
Design a modern, clean B2B SaaS web application called "PayTrack" — a corporate invoice
management dashboard used by a company's finance team to record incoming invoices, track
payment status, and report monthly spending.

Style: professional fintech, minimal, lots of whitespace, rounded corners (12px), soft
shadows, subtle borders. Data-dense but calm and readable. Left vertical sidebar navigation
with icons + labels (Dashboard, Invoices, Reports, Settings) and a top bar with search,
a "New Invoice" primary button, and a user avatar. Support both light and dark mode.

Color palette: deep indigo/blue primary (#4F46E5), slate neutrals for text and surfaces,
and clear status colors — green for "Paid", amber for "Pending", red for "Overdue".
Typography: clean sans-serif (Inter style), strong number hierarchy for financial figures.

Currency values shown in Turkish Lira (₺). Make it feel like a trustworthy financial tool.
```

---

## 2) DASHBOARD EKRANI

```
Design the Dashboard screen for PayTrack, a corporate invoice management tool.

Top section: three large KPI summary cards side by side —
  1. "Total Overdue Debt" (big red number),
  2. "Due in Next 7 Days" (amber),
  3. "This Month's Spending" (indigo).
Each card shows the number, a small label, and a tiny trend indicator (e.g. "+12% vs last month" with an up/down arrow).

Middle section: two charts side by side —
  a donut/pie chart titled "Spending by Category" (Energy, Software, Rent, Kitchen),
  and a line chart titled "Payment Trend — Last 6 Months".

Bottom: a small "Due Today" alert banner and a compact recent invoices table.
Left sidebar navigation, top bar with search and a "New Invoice" button. Light and dark mode.
Modern fintech look, indigo primary, rounded cards, soft shadows.
```

---

## 3) FATURA LİSTESİ EKRANI

```
Design an "Invoices" list screen for PayTrack.

A full-width data table with columns: Invoice No, Vendor, Category (as colored chips),
Amount, Due Date, Status (green "Paid" / amber "Pending" / red "Overdue" badges), and an
actions menu. Rows whose due date is approaching are highlighted with a subtle red/left-border accent.

Above the table: a search bar ("Search by vendor..."), filter dropdowns (Status, Category),
and sort controls (by amount / by date, ascending/descending). A primary "New Invoice" button
on the right. Pagination at the bottom. Clean, professional, indigo accent, light and dark mode.
```

---

## 4) FATURA GİRİŞ FORMU (Modal)

```
Design a "New Invoice" form as a right-side slide-over panel (or centered modal) for PayTrack.

Fields: Invoice Number (text), Vendor Name (text), Category (dropdown select: Energy, Software,
Rent, Kitchen), Amount (number with currency selector: ₺/$/€), Due Date (date picker),
Status (segmented control: Pending/Paid/Overdue), Notes (textarea).

Clear labels, generous spacing, a primary "Save Invoice" button and a "Cancel" text button
at the bottom. Modern, minimal, indigo accent, rounded inputs with subtle borders. Light and dark mode.
```

---

## Bana geri dönerken şunları söyle:
- Hangi ekran/renk/düzeni beğendin, neyi beğenmedin?
- Sidebar solda mı olsun, üstte mi?
- Kartlar/grafikler nasıl dursun?
- İstersen kendi ekran görüntülerini de gönder, üstünde konuşalım.
