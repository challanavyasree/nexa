import React, { useState, useEffect } from 'react';
import type { AgentStatus, ApiSettings, AudienceContext, ContentContext, CreatorContext, DocumentItem, GeneratedOutput, IntentType, PageType, Project, TargetAudience, TemporarySession, VerificationClaim } from './types';
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
import { TemporaryView } from './components/TemporaryView';
import { ApiKeyModal } from './components/ApiKeyModal';

export const App: React.FC = () => {
  // Navigation & Projects
  const [activePage, setActivePage] = useState<PageType>('dashboard');
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [activeProject, setActiveProject] = useState<Project>(INITIAL_PROJECTS[0]);

  // Documents & Active Selection
  const [documents, setDocuments] = useState<DocumentItem[]>([INITIAL_DEMO_DOCUMENT]);
  const [activeDocument, setActiveDocument] = useState<DocumentItem | null>(INITIAL_DEMO_DOCUMENT);

  // Temporary Analysis Session State
  const [temporarySession, setTemporarySession] = useState<TemporarySession | null>(null);

  // 24-Hour Expiration Automated Check
  useEffect(() => {
    if (temporarySession) {
      if (Date.now() > temporarySession.expiresAt) {
        // Session expired after 24 hours -> clean up
        setTemporarySession(null);
      }
    }
  }, [temporarySession]);

  // Generation Parameters
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('Management');
  const [customAudienceText, setCustomAudienceText] = useState<string>('');
  const [intent, setIntent] = useState<IntentType>('Information');
  const [customIntentText, setCustomIntentText] = useState<string>('');

  // Multi-Agent State
  const [agents, setAgents] = useState<AgentStatus[]>(INITIAL_AGENTS);

  // Outputs & Claims
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

  const [claims, setClaims] = useState<VerificationClaim[]>(INITIAL_VERIFICATION_CLAIMS);

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiSettings, setApiSettings] = useState<ApiSettings>({
    apiKey: '',
    provider: 'mock',
    modelName: 'mock-engine',
    apiUrl: 'http://localhost:8000'
  });

  // Action: Create New Project (Normal Flow)
  const handleCreateProject = (newProj: Project) => {
    setProjects(prev => [newProj, ...prev]);
    setActiveProject(newProj);
    setActivePage('projects');
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

  // Action: Save Temporary Session As Permanent Project
  const handleSaveTemporaryAsProject = (tempSession: TemporarySession, projName: string, projDesc: string) => {
    const newProjId = `proj-${Date.now()}`;
    const permDocId = tempSession.document ? `doc-${Date.now()}` : '';

    let permanentDoc: DocumentItem | null = null;
    if (tempSession.document) {
      permanentDoc = {
        ...tempSession.document,
        id: permDocId,
        projectId: newProjId,
        isDemo: false
      };
      setDocuments(prev => [permanentDoc!, ...prev]);
      setActiveDocument(permanentDoc);
    }

    const permanentOutputs = tempSession.outputs.map(out => ({
      ...out,
      id: `out-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      docId: permDocId,
      projectId: newProjId
    }));
    setOutputs(permanentOutputs);

    const newProject: Project = {
      id: newProjId,
      name: projName,
      description: projDesc,
      createdAt: new Date().toISOString().split('T')[0],
      creatorContext: tempSession.creatorContext,
      audienceContext: tempSession.audienceContext,
      contentContext: tempSession.contentContext,
      documentIds: permanentDoc ? [permanentDoc.id] : [],
      outputIds: permanentOutputs.map(o => o.id)
    };

    setProjects(prev => [newProject, ...prev]);
    setActiveProject(newProject);

    // Clear temporary session since it is now permanently saved
    setTemporarySession(null);

    // Redirect to Projects workspace
    setActivePage('projects');
  };

  // Action: Continue Without Saving Temporary Session
  const handleContinueWithoutSaving = () => {
    setActivePage('dashboard');
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
          onOpenSettings={() => setIsSettingsOpen(true)}
          activeProjectName={activeProject.name}
          setActiveProjectName={(name) => {
            const found = projects.find(p => p.name === name);
            if (found) setActiveProject(found);
          }}
          projects={projects}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 overflow-y-auto relative">
          {activePage === 'dashboard' && (
            <DashboardView
              documents={documents}
              outputs={outputs}
              claims={claims}
              projects={projects}
              onStartNewProject={() => setActivePage('projects')}
              onOpenTemporaryAnalysis={() => setActivePage('temporary')}
              onNavigatePage={setActivePage}
              onSelectProject={setActiveProject}
            />
          )}

          {activePage === 'temporary' && (
            <TemporaryView
              temporarySession={temporarySession}
              onUpdateTemporarySession={setTemporarySession}
              onSaveAsProject={handleSaveTemporaryAsProject}
              onContinueWithoutSaving={handleContinueWithoutSaving}
              onNavigatePage={setActivePage}
              apiSettings={apiSettings}
              agents={agents}
              setAgents={setAgents}
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
              onLoadDemoDoc={() => setActivePage('temporary')}
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
