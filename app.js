// Sign-ups go straight into the project's Supabase table. The publishable key below is meant to be
// public: the table only lets visitors add a row (no reading, editing or deleting), and checks every field.
const ENDPOINT = 'https://ngsvsaaznmykcouxtuxd.supabase.co/rest/v1/signups';
const KEY = 'sb_publishable_MZ7mDorh-4VWCrfB2GB8WA_p3_VTFv3';
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

for (const form of document.querySelectorAll('form[data-kind]')) {
  const status = form.querySelector('.status');
  const button = form.querySelector('button[type="submit"]');
  const email = form.elements.email;
  const say = (text, tone) => { status.textContent = text; status.className = `status ${tone ?? ''}`; };

  email.addEventListener('input', () => email.removeAttribute('aria-invalid'));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.elements.website.value) return; // bots fill the hidden field
    const address = email.value.trim();
    if (!EMAIL.test(address)) {
      email.setAttribute('aria-invalid', 'true');
      email.focus();
      say('Enter an email address like name@example.com.', 'err');
      return;
    }
    const kind = form.dataset.kind;
    const row = { kind, email: address };
    if (kind === 'beta') row.platform = form.elements.platform.value;
    else {
      const gh = form.elements.github.value.trim().replace(/^@/, '');
      if (gh) row.github = gh;
      const skills = [...form.querySelectorAll('input[name="skills"]:checked')].map((c) => c.value);
      if (skills.length) row.skills = skills.join(', ');
    }

    button.disabled = true;
    say('Sending…');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { apikey: KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify(row),
      });
      if (res.status === 201) {
        form.reset();
        say(kind === 'beta' ? "You're on the beta list. We'll email you when a build is ready." : "You're on the developer list. We'll email you to get started.", 'ok');
      } else if (res.status === 409) {
        say('That email is already on this list.', 'ok');
      } else if (res.status === 400) {
        say('That email was not accepted. Check it and try again.', 'err');
      } else {
        say(`Sign-up failed (error ${res.status}). Try again in a minute.`, 'err');
      }
    } catch {
      say("Couldn't reach the sign-up server. Check your connection and try again.", 'err');
    } finally {
      button.disabled = false;
    }
  });
}

// the trailer plays muted; one button turns the sound on
const reel = document.querySelector('.reel');
const sound = document.querySelector('.sound');
sound.addEventListener('click', () => {
  reel.muted = !reel.muted;
  if (!reel.muted) { reel.currentTime = 0; void reel.play(); }
  sound.setAttribute('aria-pressed', String(!reel.muted));
  sound.textContent = reel.muted ? 'Sound on' : 'Sound off';
});
if (matchMedia('(prefers-reduced-motion: reduce)').matches) { reel.removeAttribute('autoplay'); reel.pause(); }
