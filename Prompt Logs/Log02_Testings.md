# Team AI Prompt & Audit Log

**Project Name:** Superhero-pedia  
**Team Members:** Álvaro Pérez and Marianna Jazlyn Jimenez

---

## Testing and Debugging Entry

### 1. High-Level Goal

We wanted to investigate a reported API issue in Superhero-pedia, test the available endpoints and browser experience, then correct and recheck the issues found. This entry covers testing and bug investigation for Superhero-pedia only.

### 2. The Interaction Log

**Interaction 1 — API investigation**

**AI Tool Used:** Codex, assisted by Luna subagents  
**Exact Prompt:**  
> Acabo de hacer pull de los cambios de nuestro midterm. Necesito que los revises y que hagas pruebas para revisar que todo esté funcionando bien. Los cambios de los que hice pull fueron los del frontend que hizo mi compañera. Me había comentado que había un pequeño problema con las APIs. Me gustaría que primero lo analices, hagas una revisión de cómo está funcionando todo, hagas pruebas y me comentes qué es lo que está pasando. No hagas cambios, solamente mantente en hacer la investigación

**What the AI found:** The `/api` request returned HTTP 200 and a catalog of 563 superhero records. Searching for Batman returned three matches. The `/api/1` response included the superhero fields. Following the circular references from item 1 to item 731 and back to item 1 worked. The detail modal still tried to display older fields (`experience`, `types`, `abilities`, and `moves`) instead of the fields available for the Superhero-pedia data.

**Interaction 2 — Rerunning functional checks after the code correction**

**AI Tool Used:** Codex, assisted by Luna subagents  
**Exact Prompt:** “Ya hice los cambios necesarios para que la API funcione como debería y para que la información se muestre correctamente. Vuelve a correr las pruebas.”  
**What the AI tested:** The checks covered the `/api` response (HTTP 200 and 563 superhero records), three Batman search results, the detail fields, the circular references from item 1 to item 731 and back, resetting the search after no matches, navigation from #069 to #070, and wrapping between the first and last items. The user reported, “Todas las pruebas pasan”; this describes the functional checks listed here, not every possible test.

**Interaction 3 — Mobile detail footer alignment**

**AI Tool Used:** Codex, assisted by Luna subagents  
**Exact Prompt:**  
> Estaba corriendo pruebas manuales, viendo mobile view, y me di cuenta de que un modal está desalineado con el botón: el modal de Next y de Previous. Ayúdame a que tengan una alineación correcta en Mobile View

**What the AI changed:** After the user reported that the detail modal's Previous and Next buttons were vertically misaligned on mobile, Codex hid the keyboard hint below the small-screen breakpoint using `d-none d-sm-inline`. The user rechecked the mobile view and confirmed that the footer is now aligned correctly.

### 3. The Human Audit & Modifications

We first asked for an investigation without code changes. After the correction, we asked for the functional checks to be run again and reported that they passed. We then shared a screenshot showing that the detail modal's Previous and Next buttons did not align on mobile. Codex hid the keyboard hint at small screen sizes, and we rechecked and confirmed that the footer now aligns correctly.

### 4. Integration & Learnings

The investigation found that the modal referenced fields from an older data shape instead of the fields returned for Superhero-pedia. The follow-up checks covered the API data, modal fields, search, and navigation. We also learned to inspect the mobile detail footer separately from the catalog grid. We confirmed that the mobile footer change corrected its alignment; these checks do not claim broader API or deployment coverage.

### 5. Oral Defense Self-Check

- [ ] We can explain that `/api` returned HTTP 200 and a catalog of 563 superhero records, and what the `/api/1` response contained.
- [ ] We can explain how the API response, modal fields, search, and first/last item navigation were checked.
- [ ] We can explain why the modal's older field names did not match the Superhero-pedia data and which stale fields were found.
- [ ] We can explain how the mobile keyboard hint affected the footer controls, what code change was made, and how we verified the corrected alignment.
