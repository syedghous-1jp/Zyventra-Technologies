package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"time"
)
// Request aur Response structures
type AnalyzeRequest struct {
	TerraformCode string `json:"terraform_code"`
}

type Role struct {
	Name         string   `json:"name"`
	Findings     []string `json:"findings"`
	LastUsedDays int      `json:"last_used_days"` // Version 1
}

type AnalyzeResponse struct {
	Success bool   `json:"success"`
	Roles   []Role `json:"roles"`
	Error   string `json:"error,omitempty"`
}

func Handler(w http.ResponseWriter, r *http.Request) {
	// CORS header (taake frontend call kar sake)
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != "POST" {
		http.Error(w, "Only POST", http.StatusMethodNotAllowed)
		return
	}

	var req AnalyzeRequest
	json.NewDecoder(r.Body).Decode(&req)
	code := strings.TrimSpace(req.TerraformCode)
	if code == "" {
		sendJSON(w, AnalyzeResponse{Success: false, Error: "No code provided"})
		return
	}

	roles := extractRoles(code) // neeche function hai

	if len(roles) == 0 {
		roles = []Role{{Name: "no-roles", Findings: []string{"No IAM roles found"}, LastUsedDays: -1}}
	}

	sendJSON(w, AnalyzeResponse{Success: true, Roles: roles})
}

func sendJSON(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

// extractRoles Terraform code se roles nikaalta hai aur version 2 checks lagata hai
func extractRoles(code string) []Role {
	var roles []Role
	// Simple regex: resource "aws_iam_role" "role_name" { ... }
	re := regexp.MustCompile(`resource\s+"aws_iam_role"\s+"([^"]+)"`)
	matches := re.FindAllStringSubmatch(code, -1)

	for _, match := range matches {
		roleName := match[1]
		findings := []string{}

		// Version 2 Checks: poora code scan karte hain (thoda kasar rehti hai, lekin kaam chalega)
		if strings.Contains(code, `Action = "*"`) || strings.Contains(code, `"Action": "*"`) {
			findings = append(findings, "Wildcard action (*) detected")
		}
		if strings.Contains(code, `Principal = "*"`) || strings.Contains(code, `"Principal": "*"`) {
			findings = append(findings, "Public principal (anyone) allowed")
		}
		// MFA check: agar condition mein "MultiFactorAuthPresent" nahi hai to warning
		if !strings.Contains(code, "MultiFactorAuthPresent") && !strings.Contains(code, "multiFactorAuthPresent") {
			findings = append(findings, "No MFA condition found – add MFA protection")
		}

		if len(findings) == 0 {
			findings = append(findings, "No critical issues found")
		}

		// Version 1: Dummy last used days (180 din)
		lastUsed := 180 // aap ise change kar sakte ho

		roles = append(roles, Role{
			Name:         roleName,
			Findings:     findings,
			LastUsedDays: lastUsed,
		})
	}

	// Agar roles nahi mile to duplicate resource check ke liye
	if len(roles) == 0 && strings.Contains(code, "aws_iam_role") {
		roles = append(roles, Role{Name: "unknown", Findings: []string{"Role found but parsing incomplete"}, LastUsedDays: 0})
	}
	return roles
}
