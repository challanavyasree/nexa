import React, { useState } from 'react';
import type { AgentStatus, ApiSettings, AudienceContext, ContentContext, CreatorContext, DocumentItem, GeneratedOutput, IntentType, PageType, Project, TargetAudience, VerificationClaim } from './types';
import { INITIAL_DEMO_DOCUMENT, INITIAL_PROJECTS, INITIAL_VERIFICATION_CLAIMS, generateSampleOutputs } from './services/sampleData';
import { INITIAL_AGENTS } from './services/aiGenerator';
import { verifyOutputConsistency } from './services/consistencyVerifier';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { DashboardView } from './components/DashboardView';
import { ProjectsView } from './components/ProjectsView';
import { DocumentsView } from './components/DocumentsView';
import { GenerateView } from './components/GenerateView';
import { OutputsView } from './components/OutputsView';
import { VerificationView } from './components/VerificationView';
import { ReviewView } from './components/ReviewView';
import { ApiKeyModal } from './components/ApiKeyModal';

export const App: React.FC = () => {
  // Navigation & Projects
  const [activePage, setActivePage] = useState<PageType>('dashboard');
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [activeProject, setActiveProject] = useState<Project>(INITIAL_PROJECTS[0]);

  // Documents
  const [documents, setDocuments] = useState<DocumentItem[]>([INITIAL_DEMO_DOCUMENT]);
  const [activeDocument, setActiveDocument] = useState<DocumentItem | null>(INITIAL_DEMO_DOCUMENT);

  // Generation Parameters
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('Management');
  const [customAudienceText, setCustomAudienceText] = useState<string>('');
  const [intent, setIntent] = useState<IntentType>('Information');
  const [customIntentText, setCustomIntentText] = useState<string>('');

  // Multi-Agent State
  const [agents, setAgents] = useState<AgentStatus[]>(INITIAL_AGENTS);

  // Outputs
  const [outputs, setOutputs] = useState<GeneratedOutput[]>(() =>
    generateSampleOutputs(
      INITIAL_DEMO_DOCUMENT.id,
      INITIAL_PROJECTS[0].id,
      INITIAL_DEMO_DOCUMENT.name,
      INITIAL_PROJECTS[0].creatorContext,
      INITIAL_PROJECTS[0].audienceContext,
      INITIAL_PROJECTS[0].contentContext
    )
  );

  // Verification Claims
  const [claims, setClaims] = useState<VerificationClaim[]>(INITIAL_VERIFICATION_CLAIMS);

  // Settings Modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiSettings, setApiSettings] = useState<ApiSettings>({
    apiKey: '',
    provider: 'mock',
    modelName: 'mock-engine',
    apiUrl: 'http://localhost:8000'
  });

  // Action: Create New Project
  const handleCreateProject = (newProj: Project) => {
    setProjects(prev => [newProj, ...prev]);
  };

  // Action: Update Project Context Parameters
  const handleUpdateProjectContext = (
    projId: string,
    creatorCtx: CreatorContext,
    audienceCtx: AudienceContext,
    contentCtx: ContentContext
  ) => {
    setProjects(prev => prev.map(p => p.id === projId ? {
      ...p,
      creatorContext: creatorCtx,
      audienceContext: audienceCtx,
      contentContext: contentCtx
    } : p));

    if (activeProject.id === projId) {
      setActiveProject(prev => ({
        ...prev,
        creatorContext: creatorCtx,
        audienceContext: audienceCtx,
        contentContext: contentCtx
      }));
    }
  };

  // Action: Load Generic Demo Document & Outputs
  const handleLoadDemoDoc = () => {
    const exists = documents.find(d => d.id === INITIAL_DEMO_DOCUMENT.id);
    if (!exists) {
      setDocuments(prev => [INITIAL_DEMO_DOCUMENT, ...prev]);
    }
    setActiveDocument(INITIAL_DEMO_DOCUMENT);

    const demoOutputs = generateSampleOutputs(
      INITIAL_DEMO_DOCUMENT.id,
      activeProject.id,
      INITIAL_DEMO_DOCUMENT.name,
      activeProject.creatorContext,
      activeProject.audienceContext,
      activeProject.contentContext
    );
    setOutputs(demoOutputs);

    const demoClaims = demoOutputs.flatMap(o =>
      verifyOutputConsistency(o, INITIAL_DEMO_DOCUMENT.rawText, INITIAL_DEMO_DOCUMENT.name)
    );
    setClaims(demoClaims);

    setActivePage('documents');
  };

  // Action: Add Uploaded Document
  const handleAddDocument = (newDoc: DocumentItem) => {
    setDocuments(prev => [newDoc, ...prev]);
  };

  // Action: Delete Document
  const handleDeleteDocument = (docId: string) => {
    const updated = documents.filter(d => d.id !== docId);
    setDocuments(updated);
    if (activeDocument?.id === docId) {
      setActiveDocument(updated[0] || null);
    }
  };

  // Action: Update Outputs when Generated
  const handleOutputsGenerated = (newOutputs: GeneratedOutput[]) => {
    setOutputs(newOutputs);

    if (activeDocument) {
      const newClaims = newOutputs.flatMap(o =>
        verifyOutputConsistency(o, activeDocument.rawText, activeDocument.name)
      );
      setClaims(newClaims);
    }
    setActivePage('outputs');
  };

  // Action: Update Single Output
  const handleUpdateOutput = (updatedOutput: GeneratedOutput) => {
    setOutputs(prev => prev.map(o => o.id === updatedOutput.id ? updatedOutput : o));

    if (activeDocument) {
      const updatedClaims = outputs.map(o => o.id === updatedOutput.id ? updatedOutput : o).flatMap(o =>
        verifyOutputConsistency(o, activeDocument.rawText, activeDocument.name)
      );
      setClaims(updatedClaims);
    }
  };

  // Action: Regenerate Single Output
  const handleRegenerateOutput = (outputId: string) => {
    if (!activeDocument) return;
    const freshOutputs = generateSampleOutputs(
      activeDocument.id,
      activeProject.id,
      activeDocument.name,
      activeProject.creatorContext,
      activeProject.audienceContext,
      activeProject.contentContext
    );
    const targetType = outputs.find(o => o.id === outputId)?.type || 'briefing';
    const freshOne = freshOutputs.find(o => o.type === targetType);

    if (freshOne) {
      handleUpdateOutput({ ...freshOne, id: outputId });
    }
  };

  // Action: Inject Mismatch Demo Flag
  const handleInjectDemoMismatch = () => {
    if (outputs.length === 0) return;
    const target = outputs[0];
    const isAlreadyFlagged = target.inconsistencyFlag;

    if (!isAlreadyFlagged) {
      const modifiedContent = target.content.replace(/500 participants/gi, '750 participants').replace(/300 students/gi, '500 students');
      handleUpdateOutput({
        ...target,
        content: modifiedContent,
        verificationStatus: 'mismatch',
        inconsistencyFlag: true,
        inconsistencyDetail: {
          sourceValue: '500 participants',
          generatedValue: '750 participants',
          description: 'Source document states 500 participants, but generated text says 750 participants.'
        }
      });
    } else {
      const modifiedContent = target.content.replace(/750 participants/gi, '500 participants').replace(/500 students/gi, '300 students');
      handleUpdateOutput({
        ...target,
        content: modifiedContent,
        verificationStatus: 'verified',
        inconsistencyFlag: false,
        inconsistencyDetail: undefined
      });
    }
    setActivePage('verification');
  };

  const pendingReviewCount = outputs.filter(o => o.humanStatus === 'pending').length;
  const mismatchCount = claims.filter(c => c.status === 'mismatch').length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0b0f19] text-slate-100 antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        projectsCount={projects.length}
        documentsCount={documents.length}
        outputsCount={outputs.length}
        pendingReviewCount={pendingReviewCount}
        mismatchCount={mismatchCount}
      />

      {/* Main Content Workspace */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Topbar */}
        <Topbar
          currentDocument={activeDocument}
          onLoadDemoDoc={handleLoadDemoDoc}
          onOpenSettings={() => setIsSettingsOpen(true)}
          activeProjectName={activeProject.name}
          setActiveProjectName={(name) => {
            const found = projects.find(p => p.name === name);
            if (found) setActiveProject(found);
          }}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 overflow-y-auto relative">
          {activePage === 'dashboard' && (
            <DashboardView
              documents={documents}
              outputs={outputs}
              claims={claims}
              onStartNewAnalysis={() => setActivePage('documents')}
              onLoadDemoDoc={handleLoadDemoDoc}
              onNavigatePage={setActivePage}
              onSelectDocument={setActiveDocument}
            />
          )}

          {activePage === 'projects' && (
            <ProjectsView
              projects={projects}
              activeProject={activeProject}
              onSelectProject={setActiveProject}
              onCreateProject={handleCreateProject}
              onUpdateProjectContext={handleUpdateProjectContext}
              onNavigatePage={setActivePage}
              documents={documents}
              outputs={outputs}
            />
          )}

          {activePage === 'documents' && (
            <DocumentsView
              documents={documents}
              activeDocument={activeDocument}
              onSelectDocument={setActiveDocument}
              onAddDocument={handleAddDocument}
              onDeleteDocument={handleDeleteDocument}
              onLoadDemoDoc={handleLoadDemoDoc}
              onProceedToGenerate={() => setActivePage('generate')}
            />
          )}

          {activePage === 'generate' && (
            <GenerateView
              activeDocument={activeDocument}
              targetAudience={targetAudience}
              setTargetAudience={setTargetAudience}
              customAudienceText={customAudienceText}
              setCustomAudienceText={setCustomAudienceText}
              intent={intent}
              setIntent={setIntent}
              customIntentText={customIntentText}
              setCustomIntentText={setCustomIntentText}
              agents={agents}
              setAgents={setAgents}
              onOutputsGenerated={handleOutputsGenerated}
              onProceedToOutputs={() => setActivePage('outputs')}
              apiSettings={apiSettings}
            />
          )}

          {activePage === 'outputs' && (
            <OutputsView
              outputs={outputs}
              onUpdateOutput={handleUpdateOutput}
              onProceedToVerification={() => setActivePage('verification')}
              onRegenerateOutput={handleRegenerateOutput}
            />
          )}

          {activePage === 'verification' && (
            <VerificationView
              claims={claims}
              outputs={outputs}
              onProceedToReview={() => setActivePage('review')}
              onInjectDemoMismatch={handleInjectDemoMismatch}
            />
          )}

          {activePage === 'review' && (
            <ReviewView
              outputs={outputs}
              onUpdateOutput={handleUpdateOutput}
            />
          )}
        </main>
      </div>

      {/* Settings Modal */}
      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiSettings={apiSettings}
        onSaveSettings={setApiSettings}
      />
    </div>
  );
};

export default App;
