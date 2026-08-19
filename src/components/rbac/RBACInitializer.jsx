import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const DEFAULT_ROLES = [
  {
    name: "Administrator",
    description: "Full system access with all permissions",
    is_system_role: true,
    priority: 100,
    data_access_level: "full",
    permissions: {
      risks: { view: true, create: true, edit: true, delete: true, export: true, view_sensitive: true },
      controls: { view: true, create: true, edit: true, delete: true, test: true },
      audits: { view: true, create: true, edit: true, delete: true, approve: true },
      findings: { view: true, create: true, edit: true, delete: true, approve: true, view_sensitive: true },
      compliance: { view: true, create: true, edit: true, delete: true },
      incidents: { view: true, create: true, edit: true, delete: true, view_sensitive: true },
      vendors: { view: true, create: true, edit: true, delete: true, assess: true },
      clients: { view: true, create: true, edit: true, delete: true },
      reports: { view: true, create: true, export: true, view_executive: true },
      users: { view: true, create: true, edit: true, delete: true, assign_roles: true },
      settings: { view: true, edit: true }
    }
  },
  {
    name: "Risk Manager",
    description: "Manages risk register, assessments, and mitigation activities",
    is_system_role: true,
    priority: 70,
    data_access_level: "full",
    permissions: {
      risks: { view: true, create: true, edit: true, delete: false, export: true, view_sensitive: true },
      controls: { view: true, create: true, edit: true, delete: false, test: false },
      audits: { view: true, create: false, edit: false, delete: false, approve: false },
      findings: { view: true, create: false, edit: false, delete: false, approve: false, view_sensitive: false },
      compliance: { view: true, create: true, edit: true, delete: false },
      incidents: { view: true, create: true, edit: true, delete: false, view_sensitive: true },
      vendors: { view: true, create: false, edit: false, delete: false, assess: false },
      clients: { view: true, create: false, edit: false, delete: false },
      reports: { view: true, create: true, export: true, view_executive: false },
      users: { view: true, create: false, edit: false, delete: false, assign_roles: false },
      settings: { view: true, edit: false }
    }
  },
  {
    name: "Compliance Officer",
    description: "Manages compliance frameworks, requirements, and monitoring",
    is_system_role: true,
    priority: 70,
    data_access_level: "full",
    permissions: {
      risks: { view: true, create: false, edit: false, delete: false, export: true, view_sensitive: false },
      controls: { view: true, create: true, edit: true, delete: false, test: true },
      audits: { view: true, create: true, edit: true, delete: false, approve: true },
      findings: { view: true, create: true, edit: true, delete: false, approve: true, view_sensitive: true },
      compliance: { view: true, create: true, edit: true, delete: true, export: true },
      incidents: { view: true, create: false, edit: false, delete: false, view_sensitive: false },
      vendors: { view: true, create: false, edit: false, delete: false, assess: true },
      clients: { view: true, create: false, edit: false, delete: false },
      reports: { view: true, create: true, export: true, view_executive: true },
      users: { view: true, create: false, edit: false, delete: false, assign_roles: false },
      settings: { view: true, edit: false }
    }
  },
  {
    name: "Auditor",
    description: "Conducts audits, creates findings, and manages audit programs",
    is_system_role: true,
    priority: 60,
    data_access_level: "full",
    permissions: {
      risks: { view: true, create: false, edit: false, delete: false, export: true, view_sensitive: true },
      controls: { view: true, create: false, edit: false, delete: false, test: true },
      audits: { view: true, create: true, edit: true, delete: false, approve: false },
      findings: { view: true, create: true, edit: true, delete: false, approve: false, view_sensitive: true },
      compliance: { view: true, create: false, edit: false, delete: false },
      incidents: { view: true, create: false, edit: false, delete: false, view_sensitive: false },
      vendors: { view: true, create: false, edit: false, delete: false, assess: true },
      clients: { view: true, create: false, edit: false, delete: false },
      reports: { view: true, create: true, export: true, view_executive: false },
      users: { view: false, create: false, edit: false, delete: false, assign_roles: false },
      settings: { view: true, edit: false }
    }
  },
  {
    name: "Vendor Manager",
    description: "Manages vendor relationships, assessments, and third-party risk",
    is_system_role: true,
    priority: 60,
    data_access_level: "full",
    permissions: {
      risks: { view: true, create: true, edit: false, delete: false, export: true, view_sensitive: false },
      controls: { view: true, create: false, edit: false, delete: false, test: false },
      audits: { view: true, create: false, edit: false, delete: false, approve: false },
      findings: { view: true, create: false, edit: false, delete: false, approve: false, view_sensitive: false },
      compliance: { view: true, create: false, edit: false, delete: false },
      incidents: { view: true, create: true, edit: true, delete: false, view_sensitive: false },
      vendors: { view: true, create: true, edit: true, delete: true, assess: true },
      clients: { view: true, create: false, edit: false, delete: false },
      reports: { view: true, create: true, export: true, view_executive: false },
      users: { view: false, create: false, edit: false, delete: false, assign_roles: false },
      settings: { view: true, edit: false }
    }
  },
  {
    name: "Control Owner",
    description: "Responsible for implementing and maintaining controls",
    is_system_role: true,
    priority: 50,
    data_access_level: "assigned_only",
    permissions: {
      risks: { view: true, create: false, edit: false, delete: false, export: false, view_sensitive: false },
      controls: { view: true, create: true, edit: true, delete: false, test: true },
      audits: { view: true, create: false, edit: false, delete: false, approve: false },
      findings: { view: true, create: false, edit: false, delete: false, approve: false, view_sensitive: false },
      compliance: { view: true, create: false, edit: false, delete: false },
      incidents: { view: true, create: true, edit: false, delete: false, view_sensitive: false },
      vendors: { view: true, create: false, edit: false, delete: false, assess: false },
      clients: { view: true, create: false, edit: false, delete: false },
      reports: { view: true, create: false, export: false, view_executive: false },
      users: { view: false, create: false, edit: false, delete: false, assign_roles: false },
      settings: { view: true, edit: false }
    }
  },
  {
    name: "Analyst",
    description: "Reviews and analyzes GRC data with limited edit capabilities",
    is_system_role: true,
    priority: 40,
    data_access_level: "read_only",
    permissions: {
      risks: { view: true, create: true, edit: false, delete: false, export: true, view_sensitive: false },
      controls: { view: true, create: false, edit: false, delete: false, test: false },
      audits: { view: true, create: false, edit: false, delete: false, approve: false },
      findings: { view: true, create: true, edit: false, delete: false, approve: false, view_sensitive: false },
      compliance: { view: true, create: false, edit: false, delete: false },
      incidents: { view: true, create: true, edit: false, delete: false, view_sensitive: false },
      vendors: { view: true, create: false, edit: false, delete: false, assess: false },
      clients: { view: true, create: false, edit: false, delete: false },
      reports: { view: true, create: true, export: true, view_executive: false },
      users: { view: false, create: false, edit: false, delete: false, assign_roles: false },
      settings: { view: true, edit: false }
    }
  },
  {
    name: "Read-Only User",
    description: "View-only access to non-sensitive information",
    is_system_role: true,
    priority: 10,
    data_access_level: "read_only",
    permissions: {
      risks: { view: true, create: false, edit: false, delete: false, export: false, view_sensitive: false },
      controls: { view: true, create: false, edit: false, delete: false, test: false },
      audits: { view: true, create: false, edit: false, delete: false, approve: false },
      findings: { view: true, create: false, edit: false, delete: false, approve: false, view_sensitive: false },
      compliance: { view: true, create: false, edit: false, delete: false },
      incidents: { view: true, create: false, edit: false, delete: false, view_sensitive: false },
      vendors: { view: true, create: false, edit: false, delete: false, assess: false },
      clients: { view: true, create: false, edit: false, delete: false },
      reports: { view: true, create: false, export: false, view_executive: false },
      users: { view: false, create: false, edit: false, delete: false, assign_roles: false },
      settings: { view: false, edit: false }
    }
  }
],
  "required": ["name", "permissions"]
}