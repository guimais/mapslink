import { createContext, useContext, useEffect, useState } from "react";
import { seedUsers } from "../data/seedUsers";

const USERS_KEY = "mapslink:spa:users";
const SESSION_KEY = "mapslink:spa:session";

const AuthContext = createContext(null);

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

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => readJson(USERS_KEY, seedUsers));
  const [session, setSession] = useState(() => readJson(SESSION_KEY, null));

  useEffect(() => {
    writeJson(USERS_KEY, users);
  }, [users]);

  useEffect(() => {
    if (!session) {
      window.localStorage.removeItem(SESSION_KEY);
      return;
    }
    writeJson(SESSION_KEY, session);
  }, [session]);

  const currentUser = users.find((user) => user.id === session?.userId) ?? null;

  function login({ email, password, type }) {
    const user = users.find(
      (item) =>
        item.email.toLowerCase() === email.toLowerCase() &&
        item.password === password &&
        item.type === type,
    );

    if (!user) {
      throw new Error("Nao encontramos uma conta com esses dados.");
    }

    const nextSession = {
      userId: user.id,
      type: user.type,
      startedAt: new Date().toISOString(),
    };

    setSession(nextSession);
    return user;
  }

  function logout() {
    setSession(null);
  }

  function registerCandidate(payload) {
    const emailInUse = users.some(
      (user) => user.email.toLowerCase() === payload.email.toLowerCase(),
    );
    if (emailInUse) {
      throw new Error("Ja existe uma conta com esse e-mail.");
    }

    const user = {
      id: `usr-${Date.now()}`,
      type: "candidate",
      email: payload.email,
      password: payload.password,
      name: payload.name,
      phone: payload.phone,
      avatar: "/assets/images/candidate-avatar.png",
      profile: {
        headline: payload.headline,
        specialty: payload.specialty,
        location: payload.location,
        experience: "Perfil em construcao",
        availability: payload.availability,
        skills: payload.skills
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        bio: payload.bio,
        interviewsToday: 0,
        completion: 72,
        desiredModes: [payload.availability],
      },
    };

    setUsers((current) => [...current, user]);
    setSession({ userId: user.id, type: user.type, startedAt: new Date().toISOString() });
    return user;
  }

  function registerCompany(payload) {
    const emailInUse = users.some(
      (user) => user.email.toLowerCase() === payload.email.toLowerCase(),
    );
    if (emailInUse) {
      throw new Error("Ja existe uma conta com esse e-mail.");
    }

    const user = {
      id: `biz-${Date.now()}`,
      type: "company",
      email: payload.email,
      password: payload.password,
      name: payload.contactName,
      phone: payload.phone,
      companySlug: payload.companySlug,
      profile: {
        role: payload.role,
        completion: 64,
        tagline: payload.tagline,
      },
    };

    setUsers((current) => [...current, user]);
    setSession({ userId: user.id, type: user.type, startedAt: new Date().toISOString() });
    return user;
  }

  function updateCurrentUser(update) {
    if (!currentUser) return;

    setUsers((current) =>
      current.map((user) =>
        user.id === currentUser.id
          ? {
              ...user,
              ...update,
              profile: {
                ...user.profile,
                ...(update.profile ?? {}),
              },
            }
          : user,
      ),
    );
  }

  return (
    <AuthContext.Provider
      value={{
        users,
        currentUser,
        isAuthenticated: Boolean(currentUser),
        login,
        logout,
        registerCandidate,
        registerCompany,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }
  return context;
}
