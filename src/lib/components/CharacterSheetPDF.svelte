<script lang="ts">
  import type { Character, AttributeKey } from '$types/character';
  import { getBackgroundById } from '$data/backgrounds';
  import { getClassById, PARTIAL_CLASSES } from '$data/classes';
  import { getFocusById } from '$data/foci';
  import { getSkillById } from '$data/skills';
  import { getEquipmentById } from '$data/equipment';
  import { getAttributeModifier, formatModifier } from '$data/attributes';
  import type { PDFExportOptions } from '$lib/utils/pdfExport';

  interface Props {
    character: Character;
    options: PDFExportOptions;
  }

  let { character, options }: Props = $props();

  const background = $derived(getBackgroundById(character.backgroundId));
  const charClass = $derived(getClassById(character.classId));
  const partialClassNames = $derived(
    character.partialClasses?.map(pc =>
      PARTIAL_CLASSES.find(p => p.id === pc)?.name || pc
    ).join(' / ') || ''
  );

  const attrs: { key: AttributeKey; label: string }[] = [
    { key: 'strength', label: 'STR' },
    { key: 'dexterity', label: 'DEX' },
    { key: 'constitution', label: 'CON' },
    { key: 'intelligence', label: 'INT' },
    { key: 'wisdom', label: 'WIS' },
    { key: 'charisma', label: 'CHA' }
  ];

  const isPsychic = $derived(
    character.classId === 'psychic' ||
    character.partialClasses?.includes('partial-psychic') ||
    false
  );

  // Inventory helpers
  const readiedItems = $derived(
    character.inventory.filter(i => i.location === 'readied')
  );
  const stowedItems = $derived(
    character.inventory.filter(i => i.location === 'stowed')
  );

  // Weapons from inventory
  const weapons = $derived(
    character.inventory
      .filter(i => {
        if (i.itemId.startsWith('custom-')) return i.customCategory === 'weapon';
        const eq = getEquipmentById(i.itemId);
        return eq?.category === 'weapon';
      })
  );

  function getWeaponAttackBonus(itemId: string): string {
    const eq = getEquipmentById(itemId);
    if (!eq) return '+' + character.attackBonus;

    const baseAB = character.attackBonus;
    const isMelee = eq.subCategory === 'melee';
    const skillId = isMelee ? 'stab' : 'shoot';
    const skill = character.skills.find(s => s.skillId === skillId);
    const skillBonus = skill ? skill.rank : -1;

    let attrMod: number;
    if (eq.attribute === 'strength/dexterity') {
      attrMod = Math.max(
        getAttributeModifier(character.attributes.strength),
        getAttributeModifier(character.attributes.dexterity)
      );
    } else if (eq.attribute === 'strength') {
      attrMod = getAttributeModifier(character.attributes.strength);
    } else {
      attrMod = getAttributeModifier(character.attributes.dexterity);
    }

    const total = baseAB + skillBonus + attrMod;
    return total >= 0 ? `+${total}` : `${total}`;
  }

  function getItemName(item: { itemId: string; quantity: number; customName?: string }): string {
    if (item.itemId.startsWith('custom-') && item.customName) {
      return item.quantity > 1 ? `${item.quantity}x ${item.customName}` : item.customName;
    }
    const eq = getEquipmentById(item.itemId);
    const name = eq?.name || item.itemId;
    return item.quantity > 1 ? `${item.quantity}x ${name}` : name;
  }

  function getItemEnc(itemId: string, customEnc?: number): number {
    if (itemId.startsWith('custom-')) return customEnc ?? 1;
    return getEquipmentById(itemId)?.encumbrance ?? 0;
  }

  const readiedEnc = $derived(
    readiedItems.reduce((sum, i) => sum + getItemEnc(i.itemId, i.customEncumbrance) * i.quantity, 0)
  );
  const stowedEnc = $derived(
    stowedItems.reduce((sum, i) => sum + getItemEnc(i.itemId, i.customEncumbrance) * i.quantity, 0)
  );

  const strMod = $derived(getAttributeModifier(character.attributes.strength));
  const maxReadied = $derived(Math.max(strMod + 6, 1));
  const maxStowed = $derived(Math.max(strMod + 6, 1));

  const isColor = $derived(options.colorScheme === 'color');
  const pageWidthIn = $derived(options.pageSize === 'letter' ? '8.5in' : '210mm');
  const pageMinHeight = $derived(options.pageSize === 'letter' ? '11in' : '297mm');
</script>

<div
  class="sheet"
  style="width: {pageWidthIn}; min-height: {pageMinHeight};"
  class:sheet-color={isColor}
>
  <!-- Header -->
  <div class="sheet-header">
    <div class="header-top">
      <div class="header-name">{character.name || 'Unnamed Character'}</div>
      <div class="header-class">
        Level {character.level} {charClass?.name || character.classId}
        {#if character.classId === 'adventurer' && partialClassNames}
          ({partialClassNames})
        {/if}
      </div>
    </div>
    <div class="header-details">
      {#if background}
        <span>Background: {background.name}</span>
      {/if}
      {#if character.homeworld}
        <span>Homeworld: {character.homeworld}</span>
      {/if}
      {#if character.species}
        <span>Species: {character.species}</span>
      {/if}
      {#if character.employer}
        <span>Employer: {character.employer}</span>
      {/if}
    </div>
  </div>

  <!-- Attributes & Combat Row -->
  <div class="two-col">
    <!-- Attributes -->
    <div class="sheet-section">
      <div class="sheet-section-title" class:title-color={isColor}>Attributes</div>
      <div class="attr-grid">
        {#each attrs as { key, label }}
          {@const score = character.attributes[key] || 10}
          {@const mod = getAttributeModifier(score)}
          <div class="attr-box">
            <div class="attr-label">{label}</div>
            <div class="attr-score">{score}</div>
            <div class="attr-mod">{formatModifier(mod)}</div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Combat Stats -->
    <div class="sheet-section">
      <div class="sheet-section-title" class:title-color={isColor}>Combat</div>
      <div class="combat-grid">
        <div class="combat-stat">
          <div class="combat-label">HP</div>
          <div class="combat-value combat-hp">{character.hitPointsCurrent} / {character.hitPointsMax}</div>
        </div>
        <div class="combat-stat">
          <div class="combat-label">AC</div>
          <div class="combat-value">{character.armorClass}</div>
        </div>
        <div class="combat-stat">
          <div class="combat-label">AB</div>
          <div class="combat-value">+{character.attackBonus}</div>
        </div>
        {#if isPsychic}
          <div class="combat-stat">
            <div class="combat-label">Effort</div>
            <div class="combat-value">{character.effortCurrent ?? 0} / {character.effortMax ?? 0}</div>
          </div>
        {/if}
      </div>

      <div class="saves-section">
        <div class="sheet-section-title sub-title" class:title-color={isColor}>Saving Throws</div>
        <div class="saves-grid">
          <div class="save-item">
            <span class="save-label">Physical</span>
            <span class="save-value">{character.savingThrows.physical}+</span>
          </div>
          <div class="save-item">
            <span class="save-label">Evasion</span>
            <span class="save-value">{character.savingThrows.evasion}+</span>
          </div>
          <div class="save-item">
            <span class="save-label">Mental</span>
            <span class="save-value">{character.savingThrows.mental}+</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Skills -->
  {#if character.skills.length > 0}
    <div class="sheet-section">
      <div class="sheet-section-title" class:title-color={isColor}>Skills</div>
      <div class="skills-grid">
        {#each character.skills as skill}
          {@const skillData = getSkillById(skill.skillId)}
          <span class="skill-tag">{skillData?.name || skill.skillId}-{skill.rank}</span>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Foci -->
  {#if character.foci.length > 0}
    <div class="sheet-section">
      <div class="sheet-section-title" class:title-color={isColor}>Foci</div>
      <div class="foci-list">
        {#each character.foci as focus}
          {@const focusData = getFocusById(focus.focusId)}
          {#if focusData}
            <div class="focus-item">
              <span class="focus-name">{focusData.name} (Lvl {focus.level})</span>
              {#if options.includeDescriptions}
                <div class="focus-desc">{focusData.level1.description}</div>
                {#each focusData.level1.abilities as ability}
                  <div class="focus-ability">- {ability}</div>
                {/each}
                {#if focus.level >= 2 && focusData.level2}
                  <div class="focus-desc" style="margin-top: 2pt;">{focusData.level2.description}</div>
                  {#each focusData.level2.abilities as ability}
                    <div class="focus-ability">- {ability}</div>
                  {/each}
                {/if}
              {:else}
                <span class="focus-type">({focusData.type})</span>
              {/if}
            </div>
          {/if}
        {/each}
      </div>
    </div>
  {/if}

  <!-- Equipment -->
  <div class="sheet-section">
    <div class="sheet-section-title" class:title-color={isColor}>Equipment</div>
    <div class="two-col equipment-cols">
      <div>
        <div class="equip-header">Readied ({readiedEnc}/{maxReadied} enc)</div>
        {#if readiedItems.length > 0}
          <ul class="equip-list">
            {#each readiedItems as item}
              {@const eq = getEquipmentById(item.itemId)}
              <li>
                {getItemName(item)}
                {#if eq?.damage}
                  <span class="equip-detail">({eq.damage})</span>
                {/if}
                {#if eq?.armorClass}
                  <span class="equip-detail">(AC {eq.armorClass})</span>
                {/if}
              </li>
            {/each}
          </ul>
        {:else}
          <div class="equip-empty">None</div>
        {/if}
      </div>
      <div>
        <div class="equip-header">Stowed ({stowedEnc}/{maxStowed} enc)</div>
        {#if stowedItems.length > 0}
          <ul class="equip-list">
            {#each stowedItems as item}
              <li>
                {getItemName(item)}
                <span class="equip-detail">(enc {getItemEnc(item.itemId, item.customEncumbrance)})</span>
              </li>
            {/each}
          </ul>
        {:else}
          <div class="equip-empty">None</div>
        {/if}
      </div>
    </div>
    <div class="credits-line">Credits: {character.credits}</div>
  </div>

  <!-- Weapons Table -->
  {#if weapons.length > 0}
    <div class="sheet-section">
      <div class="sheet-section-title" class:title-color={isColor}>Weapons</div>
      <table class="weapon-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Damage</th>
            <th>Range</th>
            <th>Shock</th>
            <th>Attribute</th>
            <th>Attack</th>
          </tr>
        </thead>
        <tbody>
          {#each weapons as w}
            {@const eq = getEquipmentById(w.itemId)}
            {#if eq}
              <tr>
                <td>{eq.name}</td>
                <td>{eq.damage || '-'}</td>
                <td>{eq.range || 'Melee'}</td>
                <td>{eq.shock || '-'}</td>
                <td>{eq.attribute || '-'}</td>
                <td>{getWeaponAttackBonus(w.itemId)}</td>
              </tr>
            {/if}
          {/each}
        </tbody>
      </table>
    </div>
  {/if}

  <!-- Notes -->
  {#if options.includeNotes}
    <div class="sheet-section">
      <div class="sheet-section-title" class:title-color={isColor}>Notes</div>
      {#if character.goals}
        <div class="notes-field">
          <span class="notes-label">Goals:</span> {character.goals}
        </div>
      {/if}
      {#if character.notes}
        <div class="notes-field">
          <span class="notes-label">Notes:</span> {character.notes}
        </div>
      {/if}
      {#if !character.goals && !character.notes}
        <div class="notes-blank"></div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .sheet {
    padding: 0.4in;
    background: white;
    color: black;
    font-family: 'Helvetica', 'Arial', sans-serif;
    font-size: 9pt;
    line-height: 1.3;
    box-sizing: border-box;
  }

  .sheet-header {
    border-bottom: 2pt solid black;
    padding-bottom: 6pt;
    margin-bottom: 8pt;
  }

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 4pt;
  }

  .header-name {
    font-size: 18pt;
    font-weight: bold;
  }

  .header-class {
    font-size: 12pt;
    font-weight: 600;
    color: #333;
  }

  .header-details {
    display: flex;
    flex-wrap: wrap;
    gap: 12pt;
    margin-top: 4pt;
    font-size: 8pt;
    color: #555;
  }

  .sheet-section {
    border: 1pt solid #333;
    padding: 6pt;
    margin-bottom: 6pt;
  }

  .sheet-section-title {
    font-size: 8pt;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 0.5pt solid #999;
    margin-bottom: 4pt;
    padding-bottom: 2pt;
    color: #222;
  }

  .title-color {
    color: #0e7490;
    border-bottom-color: #0e7490;
  }

  .sub-title {
    margin-top: 6pt;
  }

  .two-col {
    display: flex;
    gap: 6pt;
  }

  .two-col > * {
    flex: 1;
  }

  /* Attributes */
  .attr-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 3pt;
    text-align: center;
  }

  .attr-box {
    border: 0.5pt solid #555;
    padding: 2pt;
  }

  .attr-label {
    font-size: 7pt;
    font-weight: bold;
    color: #333;
  }

  .attr-score {
    font-size: 14pt;
    font-weight: bold;
    line-height: 1.2;
  }

  .attr-mod {
    font-size: 8pt;
    color: #555;
  }

  /* Combat */
  .combat-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 4pt;
    text-align: center;
  }

  .combat-stat {
    border: 0.5pt solid #999;
    padding: 3pt;
  }

  .combat-label {
    font-size: 7pt;
    font-weight: bold;
    text-transform: uppercase;
    color: #555;
  }

  .combat-value {
    font-size: 13pt;
    font-weight: bold;
  }

  .combat-hp {
    font-size: 11pt;
  }

  /* Saves */
  .saves-section {
    margin-top: 4pt;
  }

  .saves-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4pt;
    text-align: center;
  }

  .save-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .save-label {
    font-size: 7pt;
    color: #555;
  }

  .save-value {
    font-size: 11pt;
    font-weight: bold;
  }

  /* Skills */
  .skills-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 3pt;
  }

  .skill-tag {
    padding: 1pt 5pt;
    border: 0.5pt solid #999;
    font-size: 8pt;
    background: #f5f5f5;
  }

  /* Foci */
  .foci-list {
    display: flex;
    flex-direction: column;
    gap: 3pt;
  }

  .focus-item {
    padding: 2pt 0;
  }

  .focus-name {
    font-weight: bold;
    font-size: 9pt;
  }

  .focus-type {
    font-size: 7pt;
    color: #777;
    margin-left: 4pt;
  }

  .focus-desc {
    font-size: 7.5pt;
    color: #444;
    margin-top: 1pt;
  }

  .focus-ability {
    font-size: 7pt;
    color: #555;
    padding-left: 8pt;
  }

  /* Equipment */
  .equipment-cols {
    gap: 8pt;
  }

  .equip-header {
    font-size: 8pt;
    font-weight: bold;
    border-bottom: 0.5pt solid #ccc;
    margin-bottom: 2pt;
    padding-bottom: 1pt;
  }

  .equip-list {
    list-style: disc;
    padding-left: 12pt;
    font-size: 8pt;
    margin: 0;
  }

  .equip-list li {
    margin-bottom: 1pt;
  }

  .equip-detail {
    font-size: 7pt;
    color: #666;
  }

  .equip-empty {
    font-size: 8pt;
    color: #999;
    font-style: italic;
  }

  .credits-line {
    font-size: 8pt;
    font-weight: bold;
    margin-top: 4pt;
    padding-top: 3pt;
    border-top: 0.5pt solid #ccc;
  }

  /* Weapon table */
  .weapon-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 8pt;
  }

  .weapon-table th,
  .weapon-table td {
    border: 0.5pt solid #555;
    padding: 2pt 4pt;
    text-align: left;
  }

  .weapon-table th {
    background: #eee;
    font-weight: bold;
    font-size: 7pt;
    text-transform: uppercase;
  }

  /* Notes */
  .notes-field {
    font-size: 8pt;
    margin-bottom: 3pt;
  }

  .notes-label {
    font-weight: bold;
  }

  .notes-blank {
    min-height: 1in;
    border-bottom: 0.5pt dotted #ccc;
  }

  /* Color scheme variant */
  .sheet-color .sheet-header {
    border-bottom-color: #0e7490;
  }

  .sheet-color .header-class {
    color: #0e7490;
  }

  .sheet-color .weapon-table th {
    background: #e0f2fe;
  }

  .sheet-color .skill-tag {
    background: #f0f9ff;
    border-color: #7dd3fc;
  }
</style>
