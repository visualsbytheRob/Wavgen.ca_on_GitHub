/* ══════════════════════════════════════════════════════════
   Cloud Computing — Visual Learning World
   Interactive JavaScript — extracted for Wavgen.ca integration
   ══════════════════════════════════════════════════════════ */

// ── QUIZ ENGINE ──
const quizData = [
  {
    q: "In what year was NIST Special Publication 800-145 'The NIST Definition of Cloud Computing' published?",
    opts: ["2008", "2009", "2011", "2014"],
    correct: 2,
    explanation: "NIST SP 800-145 was published in September 2011 by Peter Mell and Timothy Grance at the National Institute of Standards and Technology. It remains the canonical, globally-referenced definition of cloud computing.",
    source: "NIST SP 800-145, September 2011 (nvlpubs.nist.gov)"
  },
  {
    q: "According to NIST SP 800-145, how many Essential Characteristics define cloud computing?",
    opts: ["3", "4", "5", "6"],
    correct: 2,
    explanation: "NIST defines exactly five essential characteristics: (1) On-Demand Self-Service, (2) Broad Network Access, (3) Resource Pooling, (4) Rapid Elasticity, and (5) Measured Service. A service must exhibit all five to be considered cloud computing.",
    source: "NIST SP 800-145, Section 2 — Essential Characteristics"
  },
  {
    q: "What is the primary difference between IaaS and PaaS according to NIST?",
    opts: [
      "IaaS is cheaper; PaaS is more expensive",
      "With IaaS you control the OS and storage; with PaaS you only control deployed applications",
      "IaaS is for large enterprises; PaaS is for startups",
      "IaaS runs on public clouds only; PaaS runs on private clouds"
    ],
    correct: 1,
    explanation: "NIST SP 800-145 defines the key distinction: IaaS gives the consumer control over operating systems, storage, and deployed applications. PaaS removes OS-level control — the consumer only controls deployed applications and possibly configuration settings for the hosting environment.",
    source: "NIST SP 800-145, Service Models — IaaS and PaaS definitions"
  },
  {
    q: "Which NIST Essential Characteristic describes the ability to scale resources automatically to match demand, where available capacity 'appears to be unlimited'?",
    opts: ["On-Demand Self-Service", "Resource Pooling", "Rapid Elasticity", "Measured Service"],
    correct: 2,
    explanation: "Rapid Elasticity is the characteristic where capabilities can be elastically provisioned and released — in some cases automatically — to scale rapidly outward and inward commensurate with demand. NIST notes that to the consumer, available resources 'often appear to be unlimited.'",
    source: "NIST SP 800-145, Essential Characteristic #4 — Rapid Elasticity"
  },
  {
    q: "In the AWS Shared Responsibility Model, which of the following is the CUSTOMER's responsibility?",
    opts: [
      "Physical security of AWS data centers",
      "Patching the host operating system and virtualization layer",
      "Configuring IAM roles, policies, and enabling MFA",
      "Maintaining the global networking fabric"
    ],
    correct: 2,
    explanation: "AWS secures the infrastructure 'of' the cloud — physical hardware, the host OS, virtualization, and networking fabric. The customer is responsible for security 'in' the cloud: IAM configuration, data encryption, guest OS patches on EC2, security groups, and application security.",
    source: "AWS Shared Responsibility Model (aws.amazon.com/compliance/shared-responsibility-model)"
  },
  {
    q: "Which AWS Well-Architected Framework pillar was added in 2021 and focuses on energy consumption and environmental impact?",
    opts: ["Cost Optimization", "Reliability", "Sustainability", "Operational Excellence"],
    correct: 2,
    explanation: "Sustainability was added as the sixth pillar of the AWS Well-Architected Framework in 2021. It focuses on minimizing the environmental impacts of running cloud workloads, including energy consumption and efficiency. The other five pillars (Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization) have been part of the framework since its earlier versions.",
    source: "AWS Well-Architected Framework — Sustainability Pillar (docs.aws.amazon.com/wellarchitected)"
  },
  {
    q: "According to NIST, what type of cloud deployment is defined as 'provisioned for open use by the general public'?",
    opts: ["Private Cloud", "Community Cloud", "Hybrid Cloud", "Public Cloud"],
    correct: 3,
    explanation: "NIST SP 800-145 defines Public Cloud as: 'The cloud infrastructure is provisioned for open use by the general public. It may be owned, managed, and operated by a business, academic, or government organization, or some combination of them. It exists on the premises of the cloud provider.' AWS, Azure, and GCP are all public clouds.",
    source: "NIST SP 800-145, Deployment Models — Public Cloud"
  },
  {
    q: "The term 'Cloud Bursting' describes a scenario where an application bursts from a private cloud into a public cloud during demand spikes. In which NIST deployment model definition does this term appear?",
    opts: ["Private Cloud", "Community Cloud", "Public Cloud", "Hybrid Cloud"],
    correct: 3,
    explanation: "NIST SP 800-145 mentions cloud bursting specifically in the Hybrid Cloud definition: '...bound together by standardized or proprietary technology that enables data and application portability (e.g., cloud bursting for load balancing between clouds).' Cloud bursting is a canonical use case for hybrid cloud architecture.",
    source: "NIST SP 800-145, Deployment Models — Hybrid Cloud"
  }
];

let answered = new Array(quizData.length).fill(false);
let score = 0;

function buildQuiz() {
  const container = document.getElementById('quizQuestions');
  container.innerHTML = '';
  quizData.forEach((item, qi) => {
    const qDiv = document.createElement('div');
    qDiv.className = 'quiz-q';
    qDiv.id = 'q-' + qi;
    const optsHtml = item.opts.map((opt, oi) =>
      `<button class="quiz-opt" onclick="answerQ(${qi},${oi})" id="opt-${qi}-${oi}">${opt}</button>`
    ).join('');
    qDiv.innerHTML = `
      <div class="quiz-q-text">Q${qi+1}. ${item.q}</div>
      <div class="quiz-options">${optsHtml}</div>
      <div class="quiz-feedback" id="fb-${qi}">
        <div id="fb-text-${qi}"></div>
        <div class="quiz-source" id="fb-src-${qi}"></div>
      </div>`;
    container.appendChild(qDiv);
  });
  updateScore();
}

function answerQ(qi, oi) {
  if (answered[qi]) return;
  answered[qi] = true;
  const item = quizData[qi];
  const isCorrect = oi === item.correct;
  if (isCorrect) score++;

  // Style options
  item.opts.forEach((_, idx) => {
    const btn = document.getElementById(`opt-${qi}-${idx}`);
    btn.disabled = true;
    if (idx === item.correct) btn.classList.add('correct');
    else if (idx === oi && !isCorrect) btn.classList.add('wrong');
  });

  // Show feedback
  const fb = document.getElementById(`fb-${qi}`);
  fb.classList.add('show', isCorrect ? 'correct-fb' : 'wrong-fb');
  document.getElementById(`fb-text-${qi}`).textContent = (isCorrect ? '✓ Correct! ' : '✗ Not quite. ') + item.explanation;
  document.getElementById(`fb-src-${qi}`).textContent = '📖 ' + item.source;

  updateScore();
}

function updateScore() {
  const total = answered.filter(Boolean).length;
  document.getElementById('quizScore').textContent = score + ' / ' + total;
  document.getElementById('quizScore').style.color = total > 0 && score === total ? '#22d3ee' : score > total/2 ? '#a3e635' : '#f472b6';
}

function resetQuiz() {
  answered = new Array(quizData.length).fill(false);
  score = 0;
  buildQuiz();
}

document.addEventListener('DOMContentLoaded', buildQuiz);

