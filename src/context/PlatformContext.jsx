import { createContext, useContext, useEffect, useState } from "react";
import { companies as seedCompanies, flattenJobs } from "../data/companies";
import { initialAgenda, initialApplications } from "../data/platformSeeds";

const DATA_VERSION = 2;
const VERSION_KEY = "mapslink:spa:version";
const COMPANIES_KEY = "mapslink:spa:companies";
const APPLICATIONS_KEY = "mapslink:spa:applications";
const CONTACTS_KEY = "mapslink:spa:contacts";

function resetStorageIfStale() {
  try {
    const stored = Number(window.localStorage.getItem(VERSION_KEY));
    if (stored !== DATA_VERSION) {
      window.localStorage.removeItem(COMPANIES_KEY);
      window.localStorage.removeItem(APPLICATIONS_KEY);
      window.localStorage.removeItem(CONTACTS_KEY);
      window.localStorage.setItem(VERSION_KEY, String(DATA_VERSION));
    }
  } catch {
    // ignore
  }
}

resetStorageIfStale();

const PlatformContext = createContext(null);

function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function PlatformProvider({ children }) {
  const [companies, setCompanies] = useState(() =>
    readJson(COMPANIES_KEY, seedCompanies),
  );
  const [applications, setApplications] = useState(() =>
    readJson(APPLICATIONS_KEY, initialApplications),
  );
  const [contactMessages, setContactMessages] = useState(() =>
    readJson(CONTACTS_KEY, []),
  );

  useEffect(() => {
    writeJson(COMPANIES_KEY, companies);
  }, [companies]);

  useEffect(() => {
    writeJson(APPLICATIONS_KEY, applications);
  }, [applications]);

  useEffect(() => {
    writeJson(CONTACTS_KEY, contactMessages);
  }, [contactMessages]);

  const jobs = flattenJobs(companies);

  function applyToJob({ jobId, candidateId, message }) {
    const alreadyApplied = applications.some(
      (application) => application.jobId === jobId && application.candidateId === candidateId,
    );

    if (alreadyApplied) {
      throw new Error("Voce ja se candidatou a esta vaga.");
    }

    const application = {
      id: `app-${Date.now()}`,
      jobId,
      candidateId,
      message,
      status: "Recebido",
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setApplications((current) => [application, ...current]);
  }

  function createCompanyProfile(payload) {
    const slugInUse = companies.some((company) => company.slug === payload.slug);
    if (slugInUse) {
      throw new Error("Esse identificador de empresa ja esta em uso.");
    }

    const company = {
      id: `cmp-${Date.now()}`,
      slug: payload.slug,
      name: payload.name,
      sector: payload.sector,
      city: payload.city,
      state: payload.state,
      address: payload.address,
      coordinates: { lat: -22.9056, lng: -47.0608 },
      website: payload.website,
      size: payload.size,
      hiring: true,
      workModes: [payload.model],
      tags: payload.tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      headline: payload.tagline,
      description: payload.description,
      founded: "2026",
      jobs: [],
    };

    setCompanies((current) => [company, ...current]);
    return company;
  }

  function updateCompanyProfile(slug, update) {
    setCompanies((current) =>
      current.map((company) =>
        company.slug === slug
          ? {
              ...company,
              ...update,
            }
          : company,
      ),
    );
  }

  function createJob(companySlug, payload) {
    const job = {
      id: `job-${Date.now()}`,
      title: payload.title,
      type: payload.type,
      mode: payload.mode,
      level: payload.level,
      salary: payload.salary,
      summary: payload.summary,
      skills: payload.skills
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    setCompanies((current) =>
      current.map((company) =>
        company.slug === companySlug
          ? {
              ...company,
              hiring: true,
              jobs: [job, ...company.jobs],
            }
          : company,
      ),
    );
  }

  function toggleJobStatus(companySlug, jobId) {
    setCompanies((current) =>
      current.map((company) => {
        if (company.slug !== companySlug) return company;

        const nextJobs = company.jobs.map((job) =>
          job.id === jobId
            ? {
                ...job,
                status: job.status === "Pausada" ? "Aberta" : "Pausada",
              }
            : job,
        );

        return {
          ...company,
          jobs: nextJobs,
        };
      }),
    );
  }

  function sendContactMessage(payload) {
    setContactMessages((current) => [
      {
        id: `msg-${Date.now()}`,
        ...payload,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
  }

  return (
    <PlatformContext.Provider
      value={{
        companies,
        jobs,
        applications,
        agenda: initialAgenda,
        contactMessages,
        applyToJob,
        createCompanyProfile,
        updateCompanyProfile,
        createJob,
        toggleJobStatus,
        sendContactMessage,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error("usePlatform deve ser usado dentro de PlatformProvider.");
  }
  return context;
}
