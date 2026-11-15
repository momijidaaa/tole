const CATS = [
        "長剣",
        "戦斧",
        "短剣",
        "魔杖",
        "長弓",
        "盾",
        "兜",
        "脚甲",
        "戦靴",
      ];
      const K = "equip-db-v2";
      const uid = () => Math.random().toString(36).slice(2, 8);
      const esc = (s) =>
        String(s ?? "").replace(
          /[&<>"]/g,
          (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
        );
      const L = (t) =>
        String(t || "")
          .split(/[\n\-−]+/)
          .map((s) => s.trim().replace(/^・\s*/, ""))
          .filter(Boolean);
      let S = null;
      try {
        const j = localStorage.getItem(K);
        if (j) S = JSON.parse(j);
      } catch (e) {}
      let seed = false;
      if (!S || !S.series) {
        S = { series: [], parts: [], items: [], g: "" };
        seed = true;
      }
      S.g = S.g || "";
      const save = () => {
        try {
          localStorage.setItem(K, JSON.stringify(S));
        } catch (e) {}
      };
      const fs = (id) =>
        S.series.find((x) => x.id === id) || { name: "?", mats: "" };
      const fp = (id) =>
        S.parts.find((x) => x.id === id) || { name: "?", mats: "" };
      function R(it) {
        const s = fs(it.s),
          p = fp(it.p);
        return {
          name: s.name + "の" + p.name,
          rank: it.rank || s.rank || "",
          lv: it.lv || s.lv || "",
          mats: [...L(s.mats), ...L(it.own), ...L(p.mats), ...L(S.g)],
        };
      }
      const opt = (arr, sel, blank) =>
        (blank ? `<option value="">${blank}</option>` : "") +
        arr
          .map(
            (o) =>
              `<option value="${esc(o.id ?? o)}"${(o.id ?? o) === sel ? " selected" : ""}>${esc(o.name ?? o)}</option>`,
          )
          .join("");
      const inp = (t, i, f, v, c, ph) =>
        `<input class="${c || ""}" data-t="${t}" data-i="${i}" data-f="${f}" value="${esc(v)}" placeholder="${ph || ""}">`;
      const ta = (t, i, f, v) =>
        `<textarea data-t="${t}" data-i="${i}" data-f="${f}">${esc(v)}</textarea>`;
      let flt = "";
      function draw() {
        ts.innerHTML =
          "<tr><th>シリーズ名</th><th>ランク</th><th>LV</th><th>共通素材</th><th></th></tr>" +
          S.series
            .map(
              (s, i) =>
                `<tr><td>${inp("series", i, "name", s.name, "m")}</td><td>${inp("series", i, "rank", s.rank, "s")}</td><td>${inp("series", i, "lv", s.lv, "s")}</td><td>${ta("series", i, "mats", s.mats)}</td><td><button data-a="del" data-t="series" data-i="${i}">削除</button></td></tr>`,
            )
            .join("");
        tp.innerHTML =
          "<tr><th>名前</th><th>種類</th><th>共通素材</th><th></th></tr>" +
          S.parts
            .map(
              (p, i) =>
                `<tr><td>${inp("parts", i, "name", p.name, "m")}</td><td><select data-t="parts" data-i="${i}" data-f="cat">${opt(CATS, p.cat, "未分類")}</select></td><td>${ta("parts", i, "mats", p.mats)}</td><td><button data-a="del" data-t="parts" data-i="${i}">削除</button></td></tr>`,
            )
            .join("");
        gm.value = S.g;
        selS.innerHTML = opt(S.series, selS.value);
        selP.innerHTML = opt(S.parts, selP.value);
        drawItems();
      }
      let fq = "",
        fpt = "",
        emp = false;
      function cntUpd() {
        cnt.textContent =
          "素材入力済 " +
          S.items.filter((it) => L(it.own).length).length +
          " / " +
          S.items.length +
          "件（表示 " +
          (ti.rows.length - 1) +
          "件）";
      }
      function drawItems() {
        document.getElementById("flt").innerHTML = opt(
          S.series,
          flt,
          "全シリーズ",
        );
        fpf.innerHTML = opt(S.parts, fpt, "全ての種類");
        const v = S.items
          .map((it, i) => ({ it, i, r: R(it) }))
          .filter(
            (o) =>
              (!flt || o.it.s === flt) &&
              (!fpt || o.it.p === fpt) &&
              (!emp || !L(o.it.own).length) &&
              (!fq || o.r.name.includes(fq)),
          );
        ti.innerHTML =
          "<tr><th>装備名</th><th>ランク</th><th>LV</th><th>個別素材（モンスター素材等）</th><th>必要素材（合成結果）</th><th></th></tr>" +
          v
            .map(
              ({ it, i, r }) =>
                `<tr class="${L(it.own).length ? "" : "em"}"><td>${esc(r.name)}<div class="n">${esc(fp(it.p).cat || "")}</div></td><td>${inp("items", i, "rank", it.rank, "s", fs(it.s).rank || "継承")}</td><td>${inp("items", i, "lv", it.lv, "s", fs(it.s).lv || "継承")}</td><td><input class="w1" data-t="items" data-i="${i}" data-f="own" value="${esc(L(it.own).join("-"))}" placeholder="複数は - で区切る"></td><td class="mats" id="r-${i}">${esc(r.mats.join("-"))}</td><td><button data-a="copyI" data-i="${i}">コピー</button> <button data-a="del" data-t="items" data-i="${i}">削除</button></td></tr>`,
            )
            .join("");
        cntUpd();
      }
      function text() {
        return S.items
          .map((it) => {
            const r = R(it);
            return (
              `・${r.name}\n${r.mats.map((m) => "-" + m).join("\n")}\nlv ${r.lv}` +
              (r.rank ? `\nrank ${r.rank}` : "")
            );
          })
          .join("\n\n");
      }
      function memo() {
        const g = L(S.g);
        return S.items
          .map((it) => {
            const r = R(it),
              m = r.mats.slice(0, r.mats.length - g.length);
            return (
              "・" +
              r.name +
              "\n-" +
              m.join("-") +
              "\n" +
              (g.length ? "/" + g.join("/") + "\n" : "") +
              "LV" +
              r.lv
            );
          })
          .join("\n");
      }
      function csv() {
        const q = (v) => '"' + String(v).replace(/"/g, '""') + '"';
        return [
          "装備名,ランク,必要素材,作成可能LV",
          ...S.items.map((it) => {
            const r = R(it);
            return [r.name, r.rank, r.mats.join(" / "), r.lv].map(q).join(",");
          }),
        ].join("\n");
      }
      function copy(t) {
        out.value = t;
        out.select();
        try {
          navigator.clipboard
            .writeText(t)
            .catch(() => document.execCommand("copy"));
        } catch (e) {
          try {
            document.execCommand("copy");
          } catch (x) {}
        }
      }
      function ensure(arr, name, mk) {
        let o = arr.find((x) => x.name === name);
        if (!o) {
          o = mk();
          arr.push(o);
        }
        return o;
      }
      function doImport() {
        let cur = null,
          list = [];
        imp.value.split("\n").forEach((raw) => {
          const l = raw.trim();
          if (!l) return;
          if (l.startsWith("・")) {
            cur = { name: l.slice(1).trim(), mats: [], lv: "" };
            list.push(cur);
          } else if (cur && /^lv\s*\d+/i.test(l)) cur.lv = l.replace(/\D/g, "");
          else if (cur && /^[-−]/.test(l))
            cur.mats.push(
              ...l
                .replace(/^[-−]+\s*/, "")
                .split(/[-−]+/)
                .map((x) => x.trim())
                .filter(Boolean),
            );
          else if (cur && l[0] === "/")
            S.g = [
              ...new Set([
                ...L(S.g),
                ...l
                  .split("/")
                  .map((x) => x.trim())
                  .filter(Boolean),
              ]),
            ].join("\n");
        });
        let n = 0;
        list.forEach((o) => {
          const k = o.name.indexOf("の");
          if (k < 1) return;
          const sn = o.name.slice(0, k),
            pn = o.name.slice(k + 1);
          const s = ensure(S.series, sn, () => ({
            id: uid(),
            name: sn,
            rank: "",
            lv: "",
            mats: "",
          }));
          const p = ensure(S.parts, pn, () => ({
            id: uid(),
            name: pn,
            cat: "",
            mats: "",
          }));
          S.items.push({
            id: uid(),
            s: s.id,
            p: p.id,
            own: o.mats.join("\n"),
            rank: "",
            lv: o.lv,
          });
          n++;
        });
        imp.value = "";
        return n;
      }
      function extract() {
        const common = (g) => {
          if (g.length < 2) return [];
          let c = L(g[0].own);
          g.slice(1).forEach((it) => {
            const x = L(it.own);
            c = c.filter((m) => x.includes(m));
          });
          return c;
        };
        const strip = (g, c) =>
          g.forEach(
            (it) =>
              (it.own = L(it.own)
                .filter((m) => !c.includes(m))
                .join("\n")),
          );
        const add = (o, c) => {
          o.mats = [...new Set([...L(o.mats), ...c])].join("\n");
        };
        S.series.forEach((s) => {
          const g = S.items.filter((i) => i.s === s.id),
            c = common(g);
          if (c.length) {
            add(s, c);
            strip(g, c);
          }
        });
        S.parts.forEach((p) => {
          const g = S.items.filter((i) => i.p === p.id);
          if (new Set(g.map((i) => i.s)).size < 2) return;
          const c = common(g);
          if (c.length) {
            add(p, c);
            strip(g, c);
          }
        });
      }
      document.addEventListener("change", (e) => {
        const t = e.target;
        if (t.id === "gm") {
          S.g = t.value;
          save();
          draw();
          return;
        }
        if (t.id === "ck") {
          emp = t.checked;
          drawItems();
          return;
        }
        if (t.id === "fpf") {
          fpt = t.value;
          drawItems();
          return;
        }
        if (t.id === "flt") {
          flt = t.value;
          draw();
          return;
        }
        if (!t.dataset.t) return;
        S[t.dataset.t][+t.dataset.i][t.dataset.f] = t.value;
        save();
        if (t.dataset.t === "items") {
          const i = +t.dataset.i,
            c = document.getElementById("r-" + i);
          if (c) c.textContent = R(S.items[i]).mats.join("-");
          const tr = t.closest("tr");
          if (tr) tr.classList.toggle("em", !L(S.items[i].own).length);
          cntUpd();
        } else draw();
      });
      document.addEventListener("input", (e) => {
        if (e.target.id === "sq") {
          fq = e.target.value.trim();
          drawItems();
        }
      });
      document.addEventListener("keydown", (e) => {
        const t = e.target;
        if (
          e.key === "Enter" &&
          !e.isComposing &&
          t.tagName === "INPUT" &&
          t.dataset.f === "own"
        ) {
          e.preventDefault();
          const a = [...document.querySelectorAll('input[data-f="own"]')],
            k = a.indexOf(t);
          t.dispatchEvent(new Event("change", { bubbles: true }));
          if (a[k + 1]) a[k + 1].focus();
        }
      });
      function tab(v) {
        document
          .querySelectorAll(".tab")
          .forEach((e) => e.classList.toggle("on", e.id === "t-" + v));
        document
          .querySelectorAll(".tabs button")
          .forEach((x) => x.classList.toggle("on", x.dataset.v === v));
      }
      document.addEventListener("click", (e) => {
        const b = e.target.closest("button");
        if (!b) return;
        const a = b.dataset.a;
        if (a === "addS")
          S.series.push({
            id: uid(),
            name: "新シリーズ",
            rank: "",
            lv: "",
            mats: "",
          });
        else if (a === "addP")
          S.parts.push({ id: uid(), name: "新装備", cat: "", mats: "" });
        else if (a === "addI") {
          if (!selS.value || !selP.value) return;
          S.items.push({
            id: uid(),
            s: selS.value,
            p: selP.value,
            own: "",
            rank: "",
            lv: "",
          });
        } else if (a === "fillS") {
          if (!selS.value) return;
          S.parts.forEach((p) => {
            if (!S.items.some((i) => i.s === selS.value && i.p === p.id))
              S.items.push({
                id: uid(),
                s: selS.value,
                p: p.id,
                own: "",
                rank: "",
                lv: "",
              });
          });
        } else if (a === "del") {
          if (!confirm("削除しますか？")) return;
          const t = b.dataset.t,
            i = +b.dataset.i,
            id = S[t][i].id;
          S[t].splice(i, 1);
          if (t === "series") S.items = S.items.filter((x) => x.s !== id);
          if (t === "parts") S.items = S.items.filter((x) => x.p !== id);
        } else if (a === "imp") {
          const n = doImport();
          out.value = n + "件取り込みました";
        } else if (a === "ext") {
          extract();
          out.value = "共通素材を振り分けました";
        } else if (a === "out") {
          out.value = text();
        } else if (a === "copyT") {
          copy(text());
          return;
        } else if (a === "copyC") {
          copy(csv());
          return;
        } else if (a === "tab") {
          tab(b.dataset.v);
          return;
        } else if (a === "copyM") {
          copy(memo());
          return;
        } else if (a === "copyI") {
          const r = R(S.items[+b.dataset.i]);
          copy(
            "・" +
              r.name +
              "\n" +
              r.mats.map((m) => "-" + m).join("\n") +
              "\nlv " +
              r.lv,
          );
          return;
        } else if (a === "clr") {
          if (!confirm("全データを消去しますか？")) return;
          S = { series: [], parts: [], items: [] };
        }
        save();
        draw();
      });
      const SEED = `・錫葉の直剣
-E石-鉄インゴット2-鉄塊2-アメジスト-洞窟ゴブリンの折れ短剣-魔力銅片2
/魔力安定液/ホウ砂融剤/柘榴石研磨材
LV5
・錫葉の鉄兜
-E石-鉄インゴット2-鉄塊2-アメジスト-洞窟ゴブリンの呪縛の鈴-魔力銅片2
/魔力安定液/ホウ砂融剤/柘榴石研磨材
LV5
・煤月の直剣
-E石-鉄インゴット2-火打石2-レッドストーンダスト-洞窟ゴブリンの刻印された牙-マナ石2
/魔力安定液/ホウ砂融剤/柘榴石研磨材
LV6
・錫葉の小刀
-E石-鉄インゴット2-火打石2-アメジスト-洞窟ゴブリンの黒掌の爪鞘-魔力銅片2
/魔力安定液/ホウ砂融剤/柘榴石研磨材
LV6
・煤月の鉄兜
-E石-銅インゴット2-ガラス板2-レッドストーンダスト-洞窟ゴブリンの族長の王冠-マナ石2
/魔力安定液/ホウ砂融剤/柘榴石研磨材
LV6
・錫葉の革靴
-E石-銅インゴット2-ウサギの皮2-アメジスト-洞窟ゴブリンの影走りの腱-魔力銅片2
/魔力安定液/ホウ砂融剤/柘榴石研磨材
LV6
・白砂の直剣
-E石-青銅インゴット2-ネザークォーツ3-洞窟ゴブリンの石削りの刃-影の残滓2
/魔力安定液/ホウ砂融剤/柘榴石研磨材
LV7
・錫葉の手斧
-E石-鉄インゴット2-トウヒの板材2-アメジスト-影牙魔狼の漆黒の爪-魔力銅片2
/魔力安定液/ホウ砂融剤/柘榴石研磨材
LV7
・煤月の小刀
-E石-銅インゴット2-糸2-レッドストーンダスト--洞窟ゴブリンの折れ短剣-マナ石2
/魔力安定液/ホウ砂融剤/柘榴石研磨材
lv7
・錫葉の丸盾
-E石-鉄インゴット2-革2-アメジスト-洞窟ゴブリンの族長の王冠-魔力銅片2
/魔力安定液/ホウ砂融剤/柘榴石研磨材
lv7
・白砂の鉄兜
-E石-青銅インゴット2-鉄塊2-ネザークォーツ-洞窟ゴブリンの銅の耳飾り-影の残滓2
/魔力安定液/ホウ砂融剤/柘榴石研磨材
lv7
・煤月の革靴
-E石-銅インゴット2-革2-レッドストーンダスト-影牙魔狼の月紋の毛皮-マナ石2
/魔力安定液/ホウ砂融剤/柘榴石研磨材
lv7
・麦穂の直剣
・煤月の手斧
・白砂の小刀
・錫葉の短弓
・煤月の丸盾
・麦穂の鉄塊
・錫葉の脛当て
・白砂の革靴
・燧石の直剣
・白砂の手斧
・麦穂の小刀
・煤月の短弓
・白砂の丸盾
・燧石の鉄兜
・煤月の脛当て
・麦穂の革靴
・梟羽の直剣
・麦穂の手斧
・燧石の小刀
・白砂の短弓
・麦穂の丸盾
・梟羽の鉄兜
・錫葉の胴鎧
・白砂の脛当て
・燧石の革靴
・麻縄の直剣
・燧石の手斧
・梟羽の小刀
・錫葉の木杖
・麦穂の短弓
・燧石の丸盾
・麻縄の鉄兜
・煤月の胴鎧
・麦穂の脛当て
・梟羽の革靴
・朴木の直剣
・梟羽の手斧
・麻縄の小刀
・煤月の木杖
・燧石の短弓
・梟羽の丸盾
・朴木の鉄兜
・白砂の胴鎧
・燧石の脛当て
・麻縄の革靴
・石畳の直剣
・麻縄の手斧
・朴木の小刀
・白砂の木杖
・梟羽の短弓
・麻縄の丸盾
・石畳の鉄兜
・麦穂の胴鎧
・梟羽の脛当て
・朴木の革靴
・土笛の直剣
・朴木の手斧
・石畳の小刀
・麦穂の木杖
・麻縄の短弓
`;
      const CM = {
        直剣: "長剣",
        手斧: "戦斧",
        小刀: "短剣",
        木杖: "魔杖",
        短弓: "長弓",
        丸盾: "盾",
        鉄兜: "兜",
        脛当て: "脚甲",
        革靴: "戦靴",
      };
      if (seed) {
        imp.value = SEED;
        doImport();
        extract();
        S.series.forEach((s) => (s.rank = "E"));
        S.parts.forEach((p) => (p.cat = CM[p.name] || ""));
        save();
      }
      draw();
      tab("items");
