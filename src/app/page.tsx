"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  LinearProgress,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import UrlInput from "@/components/UrlInput";
import LocaleSelector from "@/components/LocaleSelector";
import ExclusionList from "@/components/ExclusionList";
import ScanResults from "@/components/ScanResults";
import ThemeModeToggle from "@/components/ThemeModeToggle";
import {
  AVAILABLE_LOCALES,
  DEFAULT_EXCLUDED_TERMS,
  LocaleScanResult,
} from "@/lib/types";

export default function Home() {
  const [url, setUrl] = useState("");
  const [selectedLocales, setSelectedLocales] = useState(
    AVAILABLE_LOCALES.map((l) => l.code)
  );
  const [excludedTerms, setExcludedTerms] = useState(DEFAULT_EXCLUDED_TERMS);
  const [results, setResults] = useState<LocaleScanResult[]>([]);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidUrl = (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const handleScan = async () => {
    if (!isValidUrl(url)) {
      setError("Please enter a valid URL (include https://)");
      return;
    }
    if (selectedLocales.length === 0) {
      setError("Select at least one locale to scan");
      return;
    }

    setError(null);
    setScanning(true);
    setResults([]);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          locales: selectedLocales,
          excludedTerms,
        }),
      });

      if (!response.ok) {
        throw new Error(`Scan failed: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
            i18n Content Checker
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Scan localized pages for untranslated English content
          </Typography>
        </Box>
        <ThemeModeToggle />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Box>
          <UrlInput value={url} onChange={setUrl} disabled={scanning} />
        </Box>

        <Box>
          <LocaleSelector
            selectedLocales={selectedLocales}
            onChange={setSelectedLocales}
            disabled={scanning}
          />
        </Box>

        <Box>
          <ExclusionList
            terms={excludedTerms}
            onChange={setExcludedTerms}
            disabled={scanning}
          />
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<SearchIcon />}
            onClick={handleScan}
            disabled={scanning || !url.trim()}
            sx={{ px: 4 }}
          >
            {scanning ? "Scanning..." : "Scan pages"}
          </Button>
        </Box>

        {scanning && <LinearProgress />}

        <Alert severity="info" variant="outlined" sx={{ fontSize: "0.85rem" }}>
          <strong>How this works:</strong> Pages are fetched server-side. The
          scanner extracts visible text, removes HTML, and flags
          English-looking words not present in the target language. Results may
          vary based on page structure and JavaScript rendering.
        </Alert>

        <ScanResults results={results} />
      </Box>
    </Container>
  );
}
