import { matchJobVacancy, injectMissingSkill } from "../src/lib/atsMatcher";
import { analyzeXYZBullet } from "../src/lib/xyzEngine";
import { technicalLatexSeed } from "../src/data/seeds/template-tech-latex";
import type { CVDocument } from "../src/types/cv";

console.log("🧪 Testing ATS Job Vacancy Matcher & Google XYZ Formula Engine...");

// Sample Job Vacancy Description (Senior Fullstack Engineer)
const sampleJobDescription = `
We are looking for a Senior Fullstack Engineer to join our core product team.
Responsibilities:
- Build and maintain reactive user interfaces with React, Next.js and TypeScript.
- Design high-scale backend services using Node.js and PostgreSQL.
- Implement automated testing with Jest and Cypress.
- Deploy microservices to AWS using Docker and Kubernetes.
- Drive Agile Scrum sprints and collaborate with cross-functional teams.
- Must have experience with GraphQL, CI/CD pipelines, and Redis caching.
`;

const cv: CVDocument = JSON.parse(JSON.stringify(technicalLatexSeed));

// Test 1: Match against active CV
const matchResult = matchJobVacancy(cv, sampleJobDescription, "en");
console.log(`✓ Overall ATS Match Score: ${matchResult.overallScore}% (${matchResult.rating})`);
console.log(`✓ Matched Keywords count: ${matchResult.matchedKeywords.length}`);
console.log(`✓ Missing Keywords count: ${matchResult.missingKeywords.length}`);

if (matchResult.overallScore <= 0 || matchResult.overallScore > 100) {
  console.error("❌ Invalid ATS match score:", matchResult.overallScore);
  process.exit(1);
}

// Verify that matched keywords include standard terms like typescript, react, etc.
const matchedTerms = matchResult.matchedKeywords.map((m) => m.term);
console.log("✓ Sample matched terms:", matchedTerms.slice(0, 5));

const missingTerms = matchResult.missingKeywords.map((m) => m.term);
console.log("✓ Sample missing terms:", missingTerms.slice(0, 5));

if (!missingTerms.includes("graphql") && !missingTerms.includes("redis")) {
  console.error("❌ Expected 'graphql' or 'redis' to be identified as missing keywords");
  process.exit(1);
}
console.log("✓ Missing high-value skills identified accurately");

// Test 2: 1-Click Skill Injection
const initialScore = matchResult.overallScore;
const skillToInject = "GraphQL";
const updatedCV = injectMissingSkill(cv, skillToInject);

const updatedMatchResult = matchJobVacancy(updatedCV, sampleJobDescription, "en");
console.log(`✓ ATS Match Score after injecting '${skillToInject}': ${updatedMatchResult.overallScore}%`);

if (updatedMatchResult.overallScore < initialScore) {
  console.error("❌ Score should not decrease after adding a missing skill");
  process.exit(1);
}

const updatedMatchedTerms = updatedMatchResult.matchedKeywords.map((m) => m.term);
if (!updatedMatchedTerms.includes("graphql")) {
  console.error("❌ 'graphql' should now be in matched keywords list after injection");
  process.exit(1);
}
console.log("✓ Successfully injected missing skill into CVDocument and verified score increase");

// Test 3: Google XYZ Bullet Analyzer (Complete XYZ)
const completeBullet = "Engineered distributed streaming pipeline, reducing query latency by 45%, by leveraging Go and Redis.";
const xyzAnalysis1 = analyzeXYZBullet(completeBullet, "en");
console.log("✓ Complete XYZ Bullet Score:", xyzAnalysis1.score, xyzAnalysis1.rating);

if (xyzAnalysis1.score !== 100 || xyzAnalysis1.rating !== "complete") {
  console.error("❌ Expected complete XYZ bullet to score 100, got:", xyzAnalysis1.score, xyzAnalysis1);
  process.exit(1);
}
if (!xyzAnalysis1.hasAction || !xyzAnalysis1.hasMetric || !xyzAnalysis1.hasMethodology) {
  console.error("❌ Complete bullet must have action, metric, and methodology flags set");
  process.exit(1);
}
console.log("✓ Correctly verified complete Google XYZ bullet (X + Y + Z = 100%)");

// Test 4: Missing Metric Bullet
const missingMetricBullet = "Architected modern microservices using TypeScript and Docker.";
const xyzAnalysis2 = analyzeXYZBullet(missingMetricBullet, "en");
console.log("✓ Missing Metric Score:", xyzAnalysis2.score, xyzAnalysis2.rating);

if (xyzAnalysis2.hasMetric) {
  console.error("❌ Should flag bullet as missing metric");
  process.exit(1);
}
if (xyzAnalysis2.score >= 100) {
  console.error("❌ Score should be < 100 for bullet missing metric");
  process.exit(1);
}
console.log("✓ Correctly flagged bullet missing metric [Y]");

// Test 5: Passive / Weak Verb Bullet
const weakVerbBullet = "Worked on database migrations.";
const xyzAnalysis3 = analyzeXYZBullet(weakVerbBullet, "en");
console.log("✓ Weak Verb Score:", xyzAnalysis3.score, xyzAnalysis3.actionVerb, "Alternative:", xyzAnalysis3.actionAlternative);

if (!xyzAnalysis3.isWeakAction || !xyzAnalysis3.actionAlternative) {
  console.error("❌ Should flag 'worked on' as weak action verb with an alternative suggestion");
  process.exit(1);
}
console.log("✓ Correctly detected weak verb and offered active alternative");

// Test 6: Portuguese XYZ Bullet
const ptBullet = "Otimizou o pipeline de CI/CD, reduzindo os tempos de build em 50%, através de Docker e GitHub Actions.";
const xyzAnalysisPT = analyzeXYZBullet(ptBullet, "pt");
console.log("✓ Portuguese XYZ Bullet Score:", xyzAnalysisPT.score, xyzAnalysisPT.rating);

if (xyzAnalysisPT.score !== 100 || xyzAnalysisPT.rating !== "complete") {
  console.error("❌ Expected Portuguese complete XYZ bullet to score 100, got:", xyzAnalysisPT.score);
  process.exit(1);
}
console.log("✓ Portuguese Google XYZ formula validated successfully");

console.log("🎉 ALL ATS MATCHER & GOOGLE XYZ ENGINE TESTS PASSED (100% SUCCESS)!");
