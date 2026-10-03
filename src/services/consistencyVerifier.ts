import type { GeneratedOutput, VerificationClaim } from '../types';

export const verifyOutputConsistency = (
  output: GeneratedOutput,
  sourceText: string,
  docName: string
): VerificationClaim[] => {
  const claims: VerificationClaim[] = [];
  const content = output.content;
  const contentLower = content.toLowerCase();
  const sourceLower = sourceText.toLowerCase();

  // Extract first non-empty line of source text for source fact reference
  const sourceLines = sourceText.split('\n').map(l => l.trim()).filter(Boolean);
  const firstFact = sourceLines[0] || `Source file content from ${docName}`;
  const secondFact = sourceLines[1] || sourceLines[0] || `Indexed in RAG memory`;

  // 1. Source Context Grounding Claim
  const isGrounded = sourceLines.some(line => {
    const key = line.toLowerCase().slice(0, 30);
    return key.length > 5 && contentLower.includes(key);
  });

  claims.push({
    id: `claim-grounding-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    outputId: output.id,
    outputTitle: output.title,
    claimText: `Output grounded in source document (${docName}).`,
    sourceFact: firstFact,
    status: isGrounded || sourceLines.length < 3 ? 'verified' : 'needs_review',
    sourceValue: docName,
    generatedValue: output.title,
    evidenceQuote: firstFact.slice(0, 120),
    sourceDoc: docName,
    page: 1,
    confidence: isGrounded ? 0.98 : 0.88
  });

  // 2. Audience & Intent Rule Verification
  const audienceMatches = contentLower.includes(output.audience.toLowerCase());
  claims.push({
    id: `claim-audience-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    outputId: output.id,
    outputTitle: output.title,
    claimText: `Target Audience [${output.audience}] enforced in generated content.`,
    sourceFact: `Requested Target Audience: ${output.audience}`,
    status: audienceMatches ? 'verified' : 'needs_review',
    sourceValue: output.audience,
    generatedValue: audienceMatches ? output.audience : 'General Persona',
    evidenceQuote: secondFact.slice(0, 120),
    sourceDoc: docName,
    page: 1,
    confidence: audienceMatches ? 0.99 : 0.75
  });

  // 3. Hallucination / Inconsistency Flag if simulated
  if (output.inconsistencyFlag && output.inconsistencyDetail) {
    claims.unshift({
      id: `claim-hallucination-${Date.now()}`,
      outputId: output.id,
      outputTitle: output.title,
      claimText: `Hallucination Flag: ${output.inconsistencyDetail.description}`,
      sourceFact: `Source Fact: ${output.inconsistencyDetail.sourceValue}`,
      status: 'mismatch',
      sourceValue: output.inconsistencyDetail.sourceValue,
      generatedValue: output.inconsistencyDetail.generatedValue,
      evidenceQuote: firstFact.slice(0, 100),
      sourceDoc: docName,
      page: 1,
      confidence: 0.35
    });
  }

  return claims;
};
