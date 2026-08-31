---
layout: quote
class: text-center
---

<div class="qse-eyebrow">BEFORE WE START</div>

# You don't need to be ready.<br>You need to be willing.

<div class="pt-4 text-lg qse-text-muted" style="max-width: 700px; margin: 0 auto;">
Every skill over the next two days — automated testing, shift-left thinking, reading a pipeline — is built through practice, not talent you're born with.
</div>

<div class="pt-3 text-lg qse-text-muted" style="max-width: 700px; margin: 0 auto;">
The baseline you're about to see is a starting line, not a verdict.
</div>

---
layout: default
---

<div class="qse-eyebrow">DAY 1 · OPENING</div>

# The Problem

<div class="pt-3 qse-text-muted text-sm">Team baseline vs the 70% "Ready" target</div>

<div class="pt-4 flex flex-col gap-4" style="max-width: 900px;">

<v-click>
<div class="flex items-center gap-3">
  <div style="width:170px" class="text-sm">Overall baseline</div>
  <div class="relative flex-1" style="height: 26px; background: var(--qse-surface-2); border-radius: 6px;">
    <div class="absolute" style="left:70%; top:-4px; bottom:-4px; width:2px; background: var(--qse-red);"></div>
    <div class="qse-bg-primary h-full" style="width: 21.5%; border-radius: 6px;"></div>
  </div>
  <div style="width:60px" class="text-sm font-bold text-right">21.5%</div>
</div>
</v-click>

<v-click>
<div class="flex items-center gap-3">
  <div style="width:170px" class="text-sm">Coding Logic</div>
  <div class="relative flex-1" style="height: 26px; background: var(--qse-surface-2); border-radius: 6px;">
    <div class="absolute" style="left:70%; top:-4px; bottom:-4px; width:2px; background: var(--qse-red);"></div>
    <div class="h-full" style="width: 4.2%; border-radius: 6px; background: var(--qse-yellow);"></div>
  </div>
  <div style="width:60px" class="text-sm font-bold text-right">4.2%</div>
</div>
</v-click>

<v-click>
<div class="flex items-center gap-3">
  <div style="width:170px" class="text-sm">Technical roles "Ready"</div>
  <div class="relative flex-1" style="height: 26px; background: var(--qse-surface-2); border-radius: 6px;">
    <div class="absolute" style="left:70%; top:-4px; bottom:-4px; width:2px; background: var(--qse-red);"></div>
  </div>
  <div style="width:60px" class="text-sm font-bold text-right qse-text-red">0%</div>
</div>
</v-click>

<div class="text-xs qse-text-muted pt-1">Red line = 70% "Ready" target · "Ready" = able to write/maintain automated tests, not just run them by hand</div>

</div>

<v-click>
<div class="pt-5 qse-card text-sm" style="max-width: 620px; border-left: 3px solid var(--qse-primary);">
This is a <strong>systemic gap</strong>, not an individual one.
</div>
</v-click>

---
layout: quote
class: text-center
---

<div class="qse-eyebrow">THE REFRAME</div>

# "The work changes.<br>Not the person."

<div class="pt-6 text-lg qse-text-muted" style="max-width: 680px; margin: 0 auto;">
<b>SDLC</b> = the path a feature travels, idea to production. Old QA worked one stop on that path.
</div>

<div class="pt-3 text-lg qse-text-muted" style="max-width: 680px; margin: 0 auto;">
<b>QSE</b> works the whole path — split into two hats: <b>SDET</b> (the code/automation hat) and <b>QE</b> (the strategy hat).
</div>

---
layout: default
---

<div class="qse-eyebrow">BEFORE WE DIVE IN</div>

# Words you'll hear this week

<div class="text-sm qse-text-muted">In plain English — we'll point back to this page all week.</div>

<div class="grid grid-cols-4 gap-2 mt-3 text-xs">

<div class="qse-card"><b>repo</b><div class="qse-text-muted mt-1">Folder holding a project's code + full history.</div></div>
<div class="qse-card"><b>commit</b><div class="qse-text-muted mt-1">One saved snapshot of your changes.</div></div>
<div class="qse-card"><b>PR (pull request)</b><div class="qse-text-muted mt-1">Request to merge changes into the main code.</div></div>
<div class="qse-card"><b>CI/CD pipeline</b><div class="qse-text-muted mt-1">Automated build, test, deploy steps on every change.</div></div>
<div class="qse-card"><b>CI/CD gate</b><div class="qse-text-muted mt-1">Checkpoint that blocks a merge if tests fail.</div></div>
<div class="qse-card"><b>mock</b><div class="qse-text-muted mt-1">Fake stand-in for a real service, used in tests.</div></div>
<div class="qse-card"><b>E2E test</b><div class="qse-text-muted mt-1">Test that walks a full user journey.</div></div>
<div class="qse-card"><b>RCA</b><div class="qse-text-muted mt-1">Digging into WHY a bug happened.</div></div>
<div class="qse-card"><b>circuit breaker</b><div class="qse-text-muted mt-1">Stops calling a failing service, to limit damage.</div></div>
<div class="qse-card"><b>idempotency</b><div class="qse-text-muted mt-1">Doing it twice causes no extra effect.</div></div>
<div class="qse-card"><b>shift-left</b><div class="qse-text-muted mt-1">Catching problems earlier — at Plan, not just Test.</div></div>
<div class="qse-card"><b>twin-track</b><div class="qse-text-muted mt-1">Code and its test, written together.</div></div>

</div>

---
layout: default
class: text-center
transition: fade
---

<div class="w-full flex flex-col items-center" style="height: 100%;">

<div class="qse-eyebrow">THE EVIDENCE</div>

# Where the bottleneck actually is

<div class="flex-1 w-full flex items-center justify-center pt-2" style="min-height: 0;">
  <img src="/SDLC-Bottleneck.png" class="max-w-full max-h-full object-contain rounded-lg" />
</div>

<div class="qse-text-muted text-xs pt-2">SDLC stage-by-stage view of where quality issues concentrate today</div>

</div>


---
layout: default
class: text-center
transition: fade
---

<div class="w-full flex flex-col items-center" style="height: 100%;">

<div class="qse-eyebrow">MAPPING · AS-IS</div>

# As-Is: the old QA pipeline

<div class="flex-1 w-full flex items-center justify-center pt-2" style="min-height: 0;">
  <img src="/images/as_is_clean_sdlc_tc_1786072267308.jpg" class="max-w-full max-h-full object-contain rounded-lg" />
</div>

<div class="qse-text-muted text-xs pt-2">Quality is <strong>inspected, not designed</strong> — QA enters only at Test. Escaped bugs surface at Monitor, in production.</div>

</div>

---
layout: default
class: text-center
transition: fade
---

<div class="w-full flex flex-col items-center" style="height: 100%;">

<div class="qse-eyebrow">MAPPING · TO-BE</div>

# To-Be: quality at every stage

<div class="flex-1 w-full flex items-center justify-center pt-2" style="min-height: 0;">
  <img src="/images/to_be_clean_sdlc_tc_1786072267308.jpg" class="max-w-full max-h-full object-contain rounded-lg" />
</div>

<div class="qse-text-muted text-xs pt-2">Quality is <strong>designed in</strong> — QSE catches issues at every stage, moving checks earlier. That's "shift-left."</div>

</div>

---
layout: default
---

<div class="qse-eyebrow">MINDSET</div>

# Agile testing principles

<div class="flex flex-col gap-4 mt-6" style="max-width: 1020px; margin: 1.5rem auto 0;">

<v-click><div class="qse-card text-xl" style="padding: 1.15rem 1.75rem;"><span class="qse-text-primary font-bold">Quality Assistance</span> <span class="qse-text-muted">over</span> Quality Assurance</div></v-click>
<v-click><div class="qse-card text-xl" style="padding: 1.15rem 1.75rem;"><span class="qse-text-primary font-bold">Continuous Testing</span> <span class="qse-text-muted">over</span> Testing at the End</div></v-click>
<v-click><div class="qse-card text-xl" style="padding: 1.15rem 1.75rem;"><span class="qse-text-primary font-bold">Automated Checking</span> <span class="qse-text-muted">over</span> Manual Regression Testing</div></v-click>
<v-click><div class="qse-card text-xl" style="padding: 1.15rem 1.75rem;"><span class="qse-text-primary font-bold">Preventing Defects</span> <span class="qse-text-muted">over</span> Finding Defects</div></v-click>

</div>

<div class="text-xs qse-text-muted pt-5" style="max-width: 1020px; margin: 1.25rem auto 0;">4 of 12 principles behind the Agile Testing mindset — the rest, next.</div>

<!--
Quality assistance over quality assurance: Quality assurance is the process of ensuring that the software meets certain quality standards before it is released to the customer. Quality assistance, on the other hand, is the process of helping the customer achieve their quality goals by providing guidance and support throughout the development process.

Continuous testing over testing at the end: Continuous testing is the process of testing software throughout the development process, while testing at the end is the process of testing the software only once it is completed. Continuous testing allows for the early detection of defects and allows for faster delivery of the software to the customer.

Automated checking over manual regression testing: Automated checking is the process of using automation tools to test software, while manual regression testing is the process of testing software manually. Automated checking is faster and less prone to errors than manual regression testing.

Preventing defects over finding defects: Preventing defects is the process of identifying and addressing potential issues before they occur, while finding defects is the process of identifying issues after they have occurred. Preventing defects allows for a proactive approach to testing and can help minimize the number of defects that are found in the software.
-->

---
layout: default
---

<div class="qse-eyebrow">MINDSET · THE FULL LIST</div>

# ...and 8 more agile testing principles

<div class="grid grid-cols-2 gap-3 mt-5 text-sm">

<div class="qse-card">Team responsibility for quality <span class="qse-text-muted">over</span> the tester's responsibility</div>
<div class="qse-card">Whole-team approach <span class="qse-text-muted">over</span> testing departments</div>
<div class="qse-card">Technical &amp; API testing <span class="qse-text-muted">over</span> just UI testing</div>
<div class="qse-card">Exploratory testing <span class="qse-text-muted">over</span> scripted testing</div>
<div class="qse-card">User stories &amp; customer needs <span class="qse-text-muted">over</span> requirement specs</div>
<div class="qse-card">Building the best software <span class="qse-text-muted">over</span> breaking the software</div>
<div class="qse-card">Early involvement <span class="qse-text-muted">over</span> late involvement</div>
<div class="qse-card">Short feedback loop <span class="qse-text-muted">over</span> delayed feedback</div>

</div>

<!--
Team responsibility for quality over the tester's responsibility: In traditional testing approaches, the responsibility for quality lies solely with the tester. However, in a whole-team approach, the responsibility for quality is shared among the entire team, including developers, testers, and other stakeholders.

Whole team approach over testing departments and independent testing: A whole team approach is a process that involves all members of the team in the testing process, including developers, testers, and other stakeholders. This approach allows for better communication and collaboration among the team members and leads to a more efficient and effective testing process.

Technical and API testing over just UI testing: Technical and API testing is the process of testing the underlying technical aspects of the software, such as the code and the APIs. UI testing is the process of testing the user interface (UI) of the software.

Exploratory testing over scripted testing: Exploratory testing is the process of testing software by exploring it, without a preconceived test plan. Scripted testing is the process of testing software by following a predefined test plan. Exploratory testing allows for a more flexible and creative approach to testing and can lead to the discovery of defects that may not have been found through scripted testing.

User stories and customer needs over requirement specifications: User stories and customer needs are the processes in testing software that consider the needs and wants of the customer, while requirement specifications test software by following a predefined set of requirements. User stories and customer needs allow for a more customer-focused approach to testing and can lead to a better test to satisfy the purpose of the feature developed.

Building the best software over breaking the software: Building the best software is the process of creating software that meets the needs of the customer and is of the highest quality, while breaking the software is the process of finding defects in the software. Building the best software allows for a more customer-focused approach to testing and can lead to a better understanding of the customer's needs.

Early involvement over late involvement: Early involvement is the process of involving all members of the team, including testers, early in the development process, while late involvement is the process of involving testers only at the end of the development process. Early involvement allows for better communication and collaboration among the team members and leads to a more efficient and effective testing process.

Short feedback loop over delayed feedback: Having a short feedback loop is the process of providing feedback to the team members promptly, while delayed feedback is the process of providing feedback to the team members only after a significant amount of time has passed.
-->

---
layout: two-cols-header
---

<div class="qse-eyebrow">MINDSET</div>

# Quality as headlights over safety brakes

::left::

<div class="text-center">
<div class="font-bold text-lg" style="color: var(--qse-green);">Headlights</div>
<div class="text-xs qse-text-muted pt-1" style="max-width: 320px; margin: 0 auto;">Light the road ahead — see problems before you hit them.</div>
</div>

<div class="flex items-center justify-center pt-4" style="color: var(--qse-green);">
<svg width="300" height="150" viewBox="0 0 320 150" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
  <path d="M35 100 L35 82 Q35 78 40 76 L65 76 L88 48 Q92 44 98 44 L155 44 Q162 44 166 50 L188 76 L222 76 Q228 78 228 84 L228 100 Z" />
  <circle cx="65" cy="104" r="16" />
  <circle cx="195" cy="104" r="16" />
  <circle cx="223" cy="80" r="7" fill="currentColor" stroke="none" />
  <line x1="238" y1="55" x2="305" y2="15" opacity="0.55" />
  <line x1="242" y1="80" x2="312" y2="80" opacity="0.55" />
  <line x1="238" y1="105" x2="305" y2="145" opacity="0.55" />
</svg>
</div>

::right::

<div class="text-center">
<div class="font-bold text-lg" style="color: var(--qse-red);">Safety Brakes</div>
<div class="text-xs qse-text-muted pt-1" style="max-width: 320px; margin: 0 auto;">Stop the damage — only after you've already hit something.</div>
</div>

<div class="flex items-center justify-center pt-4" style="color: var(--qse-red);">
<svg width="300" height="150" viewBox="0 0 320 150" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
  <path d="M35 100 L35 82 Q35 78 40 76 L65 76 L88 48 Q92 44 98 44 L155 44 Q162 44 166 50 L188 76 L222 76 Q228 78 228 84 L228 100 Z" />
  <circle cx="65" cy="104" r="16" />
  <circle cx="195" cy="104" r="16" />
  <circle cx="40" cy="80" r="7" fill="currentColor" stroke="none" />
  <line x1="4" y1="120" x2="55" y2="120" opacity="0.55" />
  <line x1="0" y1="132" x2="48" y2="132" opacity="0.35" />
</svg>
</div>

---
layout: quote
class: text-center
---

<div class="qse-eyebrow">IN MY OWN WORDS</div>

# "I advocate for quality. I assist it. Both, always."

<div class="pt-6" style="max-width: 720px; margin: 0 auto;">
<div class="text-xl"><span class="qse-text-primary font-bold">Quality Advocate</span> <span class="qse-text-muted">over</span> Quality Assistance</div>
<div class="pt-2 text-sm qse-text-muted">I do both, at once — without waiting to be asked.</div>
</div>

<div class="pt-6" style="max-width: 720px; margin: 0 auto;">
<div class="text-xl"><span class="qse-text-primary font-bold">Preventing Defects</span> <span class="qse-text-muted">over</span> Repeating Them</div>
<div class="pt-2 text-sm qse-text-muted">Prevention only counts when the same defect never fails at the same spot again.</div>
</div>

---
layout: default
---

<div class="qse-eyebrow">THE THREAD</div>

# One Feature, the Full SDLC

<div class="text-sm pt-1" style="max-width: 900px;">
This week we follow one example feature — <strong>Cancel an Order</strong> — through all 6 SDLC stages, across both workshop days. One connected story, not disjoint exercises. Back at work, swap in any feature from your own product.
</div>

<div class="grid grid-cols-3 gap-3 pt-3">
<v-click>
<div class="qse-card text-xs">Touches 2 systems — the Orders service + the Payment service for the refund</div>
</v-click>
<v-click>
<div class="qse-card text-xs">Real edge cases — order status (Pending vs Paid), refund failure, idempotency</div>
</v-click>
<v-click>
<div class="qse-card text-xs">Connects forward — the same pattern applies to any cancel/refund flow you'll meet at work</div>
</v-click>
</div>

<div class="grid grid-cols-2 gap-4 pt-5">

<div class="qse-card">
<span class="qse-pill-sdet">DAY 1</span>
<div class="font-bold pt-1">From Tester to QSE: Shift-Left in Practice</div>
<div class="text-xs qse-text-muted pt-1">Plan → Design → Develop</div>
<div class="text-xs pt-2">Quality is Everyone's Responsibility · Prevention over Detection · Collaboration over Silos</div>
</div>

<div class="qse-card">
<span class="qse-pill-qe">DAY 2</span>
<div class="font-bold pt-1">Closing the Loop</div>
<div class="text-xs qse-text-muted pt-1">Test → Release → Monitor → Plan</div>
<div class="text-xs pt-2">Business Value Driven · Continuous Improvement</div>
</div>

</div>
