import React from "react";
import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

function safeHex(color, fallback) {
  return /^#[0-9a-fA-F]{6}$/.test(color || "") ? color : fallback;
}

function corrColor(v) {
  if (!Number.isFinite(v)) return "#a78bfa";
  if (v >= 0.65) return "#10b981";
  if (v >= 0.30) return "#eab308";
  if (v >= 0) return "#a78bfa";
  if (v >= -0.30) return "#fb923c";
  if (v >= -0.65) return "#ef4444";
  return "#dc2626";
}

function strengthText(v) {
  if (!Number.isFinite(v)) return "LIVE SNAPSHOT";
  const a = Math.abs(v);
  if (a >= 0.8) return "VERY STRONG";
  if (a >= 0.6) return "STRONG";
  if (a >= 0.3) return "MODERATE";
  if (a >= 0.1) return "WEAK";
  return "NEGLIGIBLE";
}

export default function handler(req) {
  const { searchParams } = new URL(req.url);
  const a = (searchParams.get("a") || "BTC").slice(0, 24);
  const b = (searchParams.get("b") || "ETH").slice(0, 24);
  const vRaw = Number(searchParams.get("v"));
  const v = Number.isFinite(vRaw) ? Math.max(-1, Math.min(1, vRaw)) : null;
  const colorA = safeHex(searchParams.get("ca"), "#a78bfa");
  const colorB = safeHex(searchParams.get("cb"), "#67e8f9");
  const accent = corrColor(v);
  const value = v === null ? "LIVE" : `${v >= 0 ? "+" : ""}${v.toFixed(3)}`;
  const el = React.createElement;

  return new ImageResponse(
    el(
      "div",
      {
        style: {
          width: "1200px",
          height: "630px",
          display: "flex",
          position: "relative",
          background: "linear-gradient(180deg, #0b0917 0%, #07050f 100%)",
          color: "white",
          fontFamily: "ui-monospace, Menlo, monospace",
          overflow: "hidden",
        },
      },
      [
        el("div", {
          key: "glow",
          style: {
            position: "absolute",
            inset: "-20%",
            background: `radial-gradient(circle at 50% 38%, ${accent}44 0%, transparent 34%)`,
          },
        }),
        el("div", {
          key: "line-top",
          style: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, rgba(124,58,237,0), #7c3aed 30%, #67e8f9 70%, rgba(103,232,249,0))",
          },
        }),
        el(
          "div",
          {
            key: "body",
            style: {
              display: "flex",
              flexDirection: "column",
              width: "100%",
              padding: "54px 70px",
              justifyContent: "space-between",
            },
          },
          [
            el(
              "div",
              {
                key: "top",
                style: {
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                },
              },
              [
                el(
                  "div",
                  {
                    key: "badge",
                    style: {
                      display: "flex",
                      padding: "14px 22px",
                      borderRadius: "999px",
                      border: "1px solid rgba(124,58,237,0.35)",
                      background: "rgba(124,58,237,0.14)",
                      color: "rgba(196,181,253,0.95)",
                      fontSize: 24,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                    },
                  },
                  "Live · Pyth Oracle"
                ),
                el(
                  "div",
                  {
                    key: "brand",
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                    },
                  },
                  [
                    el("div", { key: "brand1", style: { color: "#a78bfa", fontSize: 28, fontWeight: 700, letterSpacing: "0.12em" } }, "PYTH"),
                    el("div", { key: "brand2", style: { color: "rgba(255,255,255,0.28)", fontSize: 18, letterSpacing: "0.16em", textTransform: "uppercase" } }, "Correlation Tracker"),
                  ]
                ),
              ]
            ),
            el(
              "div",
              {
                key: "middle",
                style: {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "18px",
                  marginTop: "-10px",
                },
              },
              [
                el(
                  "div",
                  {
                    key: "pair",
                    style: {
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "28px",
                      fontSize: 94,
                      fontWeight: 800,
                      letterSpacing: "-0.04em",
                    },
                  },
                  [
                    el("span", { key: "a", style: { color: colorA } }, a),
                    el("span", { key: "slash", style: { color: "rgba(255,255,255,0.16)", fontWeight: 400 } }, "/"),
                    el("span", { key: "b", style: { color: colorB } }, b),
                  ]
                ),
                el("div", { key: "value", style: { color: accent, fontSize: 160, fontWeight: 800, letterSpacing: "-0.08em", lineHeight: 1 } }, value),
                el("div", { key: "label", style: { color: accent, fontSize: 28, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" } }, strengthText(v)),
              ]
            ),
            el(
              "div",
              {
                key: "footer",
                style: {
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                },
              },
              [
                el("div", { key: "f1", style: { color: "rgba(255,255,255,0.46)", fontSize: 24 } }, "Cross-asset correlation snapshot"),
                el("div", { key: "f2", style: { color: "rgba(255,255,255,0.28)", fontSize: 22 } }, "pythcorrelation.com"),
              ]
            ),
          ]
        ),
      ]
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
