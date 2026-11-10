import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { capitalize, isoToBr, monthLabel, shiftMonth, todayStr } from "../lib/format";
import { useTheme } from "../lib/settings";
import { radius } from "../lib/theme";

const WEEK = ["D", "S", "T", "Q", "Q", "S", "S"];

// Campo de data com calendário que abre aqui mesmo (sem tela por cima).
export function DateField({
  label,
  value,
  onChange,
  optional,
  placeholder = "Escolher data",
}: {
  label?: string;
  value: string; // AAAA-MM-DD ou ""
  onChange: (iso: string) => void;
  optional?: boolean;
  placeholder?: string;
}) {
  const { colors } = useTheme();
  const navBtn = {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  } as const;
  const [open, setOpen] = useState(false);
  const [view, setView] = useState((value || todayStr()).slice(0, 7));
  const today = todayStr();

  const [y, m] = view.split("-").map(Number);
  const lead = new Date(y, m - 1, 1).getDay();
  const days = new Date(y, m, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function pick(day: number) {
    onChange(`${view}-${String(day).padStart(2, "0")}`);
    setOpen(false);
  }

  return (
    <View>
      {label ? (
        <Text style={{ marginBottom: 6, fontSize: 12, fontWeight: "600", color: colors.muted }}>{label}</Text>
      ) : null}

      <Pressable
        onPress={() => {
          setView((value || todayStr()).slice(0, 7));
          setOpen(!open);
        }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: open ? colors.primary : colors.border,
          borderRadius: radius.md,
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <CalendarDays size={18} color={colors.primary} />
        <Text style={{ flex: 1, fontSize: 15, color: value ? colors.foreground : colors.muted }}>
          {value ? isoToBr(value) : placeholder}
        </Text>
        {optional && value ? (
          <Pressable onPress={() => onChange("")} hitSlop={10}>
            <X size={18} color={colors.muted} />
          </Pressable>
        ) : null}
      </Pressable>

      {open && (
        <View
          style={{
            marginTop: 8,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.lg,
            padding: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", gap: 4 }}>
              <Pressable style={navBtn} onPress={() => setView(shiftMonth(view, -12))} hitSlop={6}>
                <ChevronsLeft size={18} color={colors.primary} />
              </Pressable>
              <Pressable style={navBtn} onPress={() => setView(shiftMonth(view, -1))} hitSlop={6}>
                <ChevronLeft size={18} color={colors.primary} />
              </Pressable>
            </View>
            <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground }}>
              {capitalize(monthLabel(view))}
            </Text>
            <View style={{ flexDirection: "row", gap: 4 }}>
              <Pressable style={navBtn} onPress={() => setView(shiftMonth(view, 1))} hitSlop={6}>
                <ChevronRight size={18} color={colors.primary} />
              </Pressable>
              <Pressable style={navBtn} onPress={() => setView(shiftMonth(view, 12))} hitSlop={6}>
                <ChevronsRight size={18} color={colors.primary} />
              </Pressable>
            </View>
          </View>

          <View style={{ flexDirection: "row", marginTop: 10 }}>
            {WEEK.map((w, i) => (
              <Text
                key={i}
                style={{ width: "14.2857%", textAlign: "center", fontSize: 11, fontWeight: "600", color: colors.muted }}
              >
                {w}
              </Text>
            ))}
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 4 }}>
            {cells.map((day, i) => {
              if (day === null) return <View key={i} style={{ width: "14.2857%", height: 38 }} />;
              const iso = `${view}-${String(day).padStart(2, "0")}`;
              const selected = iso === value;
              const isToday = iso === today;
              return (
                <Pressable
                  key={i}
                  onPress={() => pick(day)}
                  style={{ width: "14.2857%", height: 38, alignItems: "center", justifyContent: "center" }}
                >
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: selected ? colors.primary : "transparent",
                      borderWidth: isToday && !selected ? 1 : 0,
                      borderColor: colors.primary,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: selected || isToday ? "700" : "400",
                        color: selected ? "#fff" : colors.foreground,
                      }}
                    >
                      {day}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
            <Pressable
              onPress={() => {
                onChange(today);
                setOpen(false);
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "600", color: colors.primary }}>Hoje</Text>
            </Pressable>
            <Pressable onPress={() => setOpen(false)}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: colors.muted }}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

