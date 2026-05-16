/* ══════════════════════════════════════════════════════════════
   Big Data World — Interactive JavaScript
   Extracted from big_data.html for integration into Wavgen.ca
   ══════════════════════════════════════════════════════════════ */

/* ── Data Stream Background ─────────────────────────────────── */
(function() {
  const bg = document.getElementById('streamBg');
  if (!bg) return;
  for (let i = 0; i < 20; i++) {
    const col = document.createElement('div');
    col.className = 'stream-col';
    col.style.left = (Math.random() * 100) + '%';
    col.style.height = (Math.random() * 30 + 15) + 'vh';
    col.style.animationDuration = (Math.random() * 8 + 6) + 's';
    col.style.animationDelay = (Math.random() * 12) + 's';
    col.style.width = (Math.random() > 0.7 ? 2 : 1) + 'px';
    bg.appendChild(col);
  }
})();

/* ── Scroll to section ───────────────────────────────────────── */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── Accordion toggle ────────────────────────────────────────── */
function toggleAcc(header) {
  const item = header.closest('.acc-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.acc-item.open').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

/* ── Pipeline toggle ─────────────────────────────────────────── */
const pipeInfo = {
  source:   { title: '📡 Data Source',    text: 'Raw data ingestion from DBs (JDBC), IoT sensors, web logs, APIs, and files. Can be batch (nightly exports) or continuous (event streams). The origin of all data in the pipeline.' },
  kafka:    { title: '🌊 Apache Kafka',   text: 'Durable, ordered, replayable event bus. Decouples producers and consumers. Handles 1M+ msg/sec. Ensures zero data loss even if downstream systems slow down or restart.' },
  hdfs:     { title: '🗄️ HDFS / S3',      text: 'Raw zone storage. HDFS for on-prem; S3/ADLS/GCS for cloud. Stores every raw event for reprocessing. Cheap, durable, append-only. Foundation of the data lake.' },
  spark:    { title: '⚡ Apache Spark',   text: 'Distributed in-memory processing. Performs ETL, aggregations, joins, and ML. Reads from HDFS/S3, writes enriched data back to storage or the warehouse.' },
  hive:     { title: '🐝 Hive / DW',      text: 'SQL serving layer. Hive on HDFS for on-prem; Snowflake/BigQuery/Redshift for cloud. Stores curated data in Parquet/ORC for BI tools and analysts.' },
  superset: { title: '📊 Apache Superset', text: 'Open-source BI platform. Connects to any SQL source. Drag-and-drop charts, dashboards, SQL Lab. Alerts, RBAC security, 40+ chart types built in.' },
  airflow:  { title: '🌬️ Apache Airflow', text: 'Workflow orchestration via Python DAGs. Schedules tasks, handles retries, sends failure alerts, and provides full audit history of every pipeline run.' }
};

function togglePipe(btn) {
  btn.classList.toggle('active');
  const node = btn.dataset.node;
  const el = document.getElementById('node-' + node);
  if (el) el.classList.toggle('active-node');
  updateArrows();
  updatePipeInfo();
}

function updateArrows() {
  const nodes = ['source', 'kafka', 'hdfs', 'spark', 'hive', 'superset'];
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = document.getElementById('node-' + nodes[i]);
    const b = document.getElementById('node-' + nodes[i + 1]);
    const arrow = document.getElementById('arrow-' + (i + 1));
    if (!arrow) continue;
    const both = a && b && a.classList.contains('active-node') && b.classList.contains('active-node');
    arrow.classList.toggle('active-arrow', both);
    const path = arrow.querySelector('path');
    if (path) path.setAttribute('stroke', both ? '#00e5ff' : '#1a3a5c');
  }
}

function updatePipeInfo() {
  const box = document.getElementById('pipeInfoBox');
  if (!box) return;
  const active = Array.from(document.querySelectorAll('.pipe-toggle.active')).map(b => b.dataset.node);
  if (active.length === 0) {
    box.innerHTML = '<h4>⚠️ No Components Active</h4><p>Toggle components above to explore different pipeline architectures.</p>';
    return;
  }
  if (active.length === 7) {
    box.innerHTML = '<h4>⚡ Full Lambda Architecture Active</h4><p>All 7 components enabled: Source → Kafka → HDFS/S3 → Spark → Hive/DW → Superset, with Airflow orchestrating every stage.</p>';
    return;
  }
  const last = active[active.length - 1];
  const info = pipeInfo[last];
  if (info) box.innerHTML = `<h4>${info.title}</h4><p>${info.text}</p>`;
}

/* ── Galaxy / Ecosystem map tips ─────────────────────────────── */
const galaxyData = {
  kafka:      { name: 'Apache Kafka',     desc: 'Distributed event streaming. 1M+ msg/sec. Born at LinkedIn; used by Netflix, Uber, and 80% of Fortune 100. Replayable, durable pub/sub.' },
  flume:      { name: 'Apache Flume',     desc: 'Distributed log aggregation. Collects streaming event data from web servers and apps into HDFS. Now largely replaced by Kafka.' },
  kinesis:    { name: 'AWS Kinesis',      desc: 'Managed real-time streaming on AWS. Data Streams, Firehose (→S3/Redshift), and Analytics (SQL on streams). Native AWS integration.' },
  pubsub:     { name: 'Google Pub/Sub',   desc: 'Fully managed GCP messaging. Globally scalable, serverless. Backbone of GCP pipelines feeding BigQuery and Dataflow.' },
  sqoop:      { name: 'Apache Sqoop',     desc: 'Bulk transfers between Hadoop and relational DBs. Import tables from MySQL/Oracle into HDFS. Mostly superseded by Spark JDBC.' },
  flink:      { name: 'Apache Flink',     desc: 'Stateful stream processing with exactly-once semantics. Lower latency than Spark Streaming. Powers real-time analytics at Alibaba & Uber.' },
  hdfs:       { name: 'HDFS',             desc: 'Hadoop Distributed File System. 128 MB blocks, 3× replication. NameNode (metadata) + DataNodes (storage). Still core to 70%+ enterprise Hadoop.' },
  s3:         { name: 'AWS S3',           desc: 'Object storage foundation of cloud data lakes. 11-nines durability. Lifecycle rules, versioning, Glacier tiering. Works with Athena, EMR, Glue.' },
  hbase:      { name: 'Apache HBase',     desc: 'Wide-column NoSQL on HDFS. Billions of rows × millions of columns. ms-level random read/write. Used for time-series, user profiles, serving layers.' },
  delta:      { name: 'Delta Lake',       desc: 'ACID transactions on Parquet (by Databricks). Time travel, schema evolution, DML on lake files. Foundation of Databricks Lakehouse.' },
  cassandra:  { name: 'Apache Cassandra', desc: 'Peer-to-peer NoSQL, no single point of failure. Linear write scaling. Used by Netflix, Instagram, and Discord for global low-latency workloads.' },
  iceberg:    { name: 'Apache Iceberg',   desc: 'Open table format for huge analytic datasets. Hidden partitioning, schema evolution, time travel. Netflix open-sourced it; emerging standard.' },
  spark:      { name: 'Apache Spark',     desc: 'Unified analytics engine. In-memory DAG execution. Python/Scala/R/SQL APIs. Spark SQL, Streaming, MLlib, GraphX. 100× faster than MapReduce.' },
  hive:       { name: 'Apache Hive',      desc: 'SQL-on-Hadoop. HiveQL compiles to Tez jobs. Metastore is the shared schema registry used by Spark, Presto, Flink, and Glue.' },
  presto:     { name: 'Presto / Trino',   desc: 'Distributed SQL query engine. Federated queries across HDFS, S3, Cassandra, MySQL in one statement. Sub-second on petabytes. Born at Facebook.' },
  dbt:        { name: 'dbt',              desc: 'Analytics engineering tool. Transform raw data with SQL SELECT models. Auto-docs, lineage DAGs, data quality tests. Works in any cloud DW.' },
  airflow:    { name: 'Apache Airflow',   desc: 'Python DAG orchestration. 1000+ built-in operators. Rich UI, alerting, SLAs, plugin ecosystem. Defacto orchestrator for data engineering.' },
  superset:   { name: 'Apache Superset',  desc: 'Open-source BI platform. 40+ chart types, drag-and-drop dashboards, SQL Lab IDE. Connects to any SQL DB. Alternative to Tableau for OSS stacks.' },
  tableau:    { name: 'Tableau',          desc: 'Industry-leading visual analytics. Drag-and-drop, Tableau Prep for cleaning. 100+ data source connectors. Most-used BI tool in Fortune 500.' },
  snowflake:  { name: 'Snowflake',        desc: 'Multi-cloud DW on AWS/Azure/GCP. Separated storage & compute. Zero-copy cloning, data sharing, 90-day Time Travel. $3B+ ARR.' },
  bigquery:   { name: 'Google BigQuery',  desc: 'Serverless, petabyte-scale DW. Columnar storage, automatic optimization. Pay-per-query. Public datasets, geospatial, BQML built in.' },
  databricks: { name: 'Databricks',       desc: 'Unified Data & AI Platform: managed Spark + Delta Lake + MLflow + Unity Catalog. Founded by Spark creators. Lakehouse pioneer. $43B valuation.' }
};

function showGalaxyTip(tool) {
  const box = document.getElementById('galaxyTip');
  const d = galaxyData[tool];
  if (!box || !d) return;
  box.innerHTML = `<h4>🔍 ${d.name}</h4><p>${d.desc}</p>`;
  box.style.borderColor = '#00e5ff';
  setTimeout(() => { if (box) box.style.borderColor = ''; }, 2000);
}

/* ── Tab switching ───────────────────────────────────────────── */
function switchTab(btn, panelId) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  const panel = document.getElementById(panelId);
  if (panel) panel.classList.add('active');
}

/* ── Copy cheat card ─────────────────────────────────────────── */
function copyCheat(btn, text) {
  navigator.clipboard.writeText(text).then(() => {
    const t = document.getElementById('toast');
    if (!t) return;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2200);
  }).catch(() => { /* silent fail for non-https */ });
}

/* ── Stat counter animation ──────────────────────────────────── */
function animateStats() {
  document.querySelectorAll('[data-target]').forEach(el => {
    const target = parseFloat(el.dataset.target);
    const isFloat = target % 1 !== 0;
    let current = 0;
    const step = target / 60;
    const interval = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(interval); }
      el.textContent = isFloat ? current.toFixed(1) : Math.round(current);
    }, 16);
  });
}

/* ── Scroll reveal + nav highlight ──────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'none';
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.card, .cheat-card, .resource-card, .roadmap-phase, .compare-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  revealObserver.observe(el);
});

/* Active nav link on scroll */
const navSections = ['hero', 'concepts', 'pipeline', 'ecosystem', 'resources', 'roadmap', 'cheatsheet', 'foundations', 'key-terms', 'knowledge-check'];
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + 80;
  navSections.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.offsetTop, bot = top + el.offsetHeight;
    if (scrollY >= top && scrollY < bot) {
      document.querySelectorAll('.nav-links a').forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + id);
      });
    }
  });
  if (scrollY > 500 && !window._statsRun) {
    window._statsRun = true;
    animateStats();
  }
}, { passive: true });

/* ── Initial pipeline state ──────────────────────────────────── */
updateArrows();

/* ── Quiz Logic ──────────────────────────────────────────────── */
let quizCorrect = 0;
function answerQ(qNum, btn, isCorrect) {
  const qEl = document.getElementById('q' + qNum);
  if (qEl.dataset.answered) return;
  qEl.dataset.answered = '1';
  qEl.querySelectorAll('.q-opt').forEach(b => { b.disabled = true; });
  btn.classList.add(isCorrect ? 'correct' : 'wrong');
  if (!isCorrect) {
    qEl.querySelectorAll('.q-opt').forEach(b => {
      if (b.getAttribute('onclick') && b.getAttribute('onclick').indexOf(',true)') !== -1) {
        b.classList.add('correct');
      }
    });
  }
  document.getElementById('exp' + qNum).classList.add('show');
  if (isCorrect) quizCorrect++;
  document.getElementById('quizScore').textContent = quizCorrect + ' / 8';
}
function resetQuiz() {
  quizCorrect = 0;
  document.getElementById('quizScore').textContent = '0 / 8';
  for (let i = 1; i <= 8; i++) {
    const qEl = document.getElementById('q' + i);
    delete qEl.dataset.answered;
    qEl.querySelectorAll('.q-opt').forEach(b => { b.disabled = false; b.classList.remove('correct', 'wrong'); });
    document.getElementById('exp' + i).classList.remove('show');
  }
}

/* ── Reveal animation for additional sections ────────────────── */
(function() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'none'; }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.paper-card, .term-card, .arch-card, .cap-wrapper, .quiz-q').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    obs.observe(el);
  });
})();
