/* ============================================================
   DOSES NA EMERGÊNCIA — base de dados
   Separada do código para permitir revisão do conteúdo
   por quem não programa. Última revisão: 2026-10-05
   ============================================================

   CAMPOS DE CADA FÁRMACO
   nome, sub, cat, apres        identificação
   ataque / manut               {txt, min, max, un, teto, piso, base, dil}
     un    mg/kg · mcg/kg · g/kg · mL/kg · U/kg · mEq/kg
           mg/kg/h · mcg/kg/h · mcg/kg/min · U/kg/h
     base  'real' (padrão) · 'ideal' · 'ajustado'
     dil   {txt, conc, cun}  concentração da solução pronta
   nota, alerta                 texto
   fonte                        procedência da dose
   ============================================================ */

const CATS = [
  {id:'todos', nome:'Todos'},
  {id:'via',   nome:'Via aérea e SRI',       cor:'var(--via)',   eixo:'trauma'},
  {id:'sed',   nome:'Analgesia e sedação',   cor:'var(--sed)',   eixo:'trauma'},
  {id:'hem',   nome:'Hemorragia',            cor:'var(--hem)',   eixo:'trauma'},
  {id:'circ',  nome:'Choque e PCR',          cor:'var(--circ)',  eixo:'trauma'},
  {id:'neuro', nome:'TCE e convulsão',       cor:'var(--neuro)', eixo:'trauma'},
  {id:'inf',   nome:'Antibióticos e tétano', cor:'var(--inf)',   eixo:'trauma'},
  {id:'esp',   nome:'Situações especiais',   cor:'var(--esp)',   eixo:'trauma'},
  {id:'sca',   nome:'Síndrome coronariana',  cor:'var(--sca)',   eixo:'clinica'},
  {id:'resp',  nome:'Asma e broncoespasmo',  cor:'var(--resp)',  eixo:'clinica'},
  {id:'pac',   nome:'Pneumonia',             cor:'var(--pac)',   eixo:'clinica'}
];

/* Diluições padrão reutilizáveis.
   conc = concentração da solução pronta; cun = unidade dessa concentração. */
const DIL = {
  nora:   {txt:'16 mg (4 ampolas de 4 mL a 2 mg/mL) + SG 5% até 250 mL', conc:64,   cun:'mcg/mL'},
  adre:   {txt:'5 mg (5 ampolas de 1 mg/mL) + SG 5% até 250 mL',          conc:20,   cun:'mcg/mL'},
  vaso:   {txt:'20 U (1 ampola) + SF 0,9% até 100 mL',                    conc:0.2,  cun:'U/mL'},
  fenta:  {txt:'1000 mcg (20 mL a 50 mcg/mL) + SF 0,9% até 100 mL',       conc:10,   cun:'mcg/mL'},
  mida:   {txt:'100 mg (20 mL a 5 mg/mL) + SF 0,9% até 100 mL',           conc:1,    cun:'mg/mL'},
  keta:   {txt:'500 mg (10 mL a 50 mg/mL) + SF 0,9% até 100 mL',          conc:5,    cun:'mg/mL'},
  propo:  {txt:'propofol 1% puro, sem diluir',                            conc:10,   cun:'mg/mL'},
  rocu:   {txt:'250 mg (25 mL a 10 mg/mL) + SF 0,9% até 250 mL',          conc:1,    cun:'mg/mL'},
  dex:    {txt:'200 mcg (2 mL a 100 mcg/mL) + SF 0,9% até 50 mL',         conc:4,    cun:'mcg/mL'},
  morf:   {txt:'50 mg (5 ampolas de 10 mg/mL) + SF 0,9% até 100 mL',      conc:0.5,  cun:'mg/mL'},
  salbiv: {txt:'5 mg (10 mL a 0,5 mg/mL) + SG 5% até 500 mL',             conc:10,   cun:'mcg/mL'},
  ntg:    {txt:'50 mg (10 mL a 5 mg/mL) + SG 5% até 250 mL',              conc:200,  cun:'mcg/mL'}
};

/* ============================================================
   FÁRMACOS
   ============================================================ */
const FARMACOS = [

/* ---------- VIA AÉREA E SEQUÊNCIA RÁPIDA ---------- */
{cat:'via', nome:'Fentanil', sub:'pré-tratamento da SRI', apres:'50 mcg/mL — ampola 2 mL e 10 mL',
 ataque:{txt:'1–3 mcg/kg IV lento, 1–3 min antes da indução', min:1, max:3, un:'mcg/kg', base:'ajustado'},
 manut:{txt:'ver Analgesia e sedação'},
 alerta:'Atenua a resposta simpática à laringoscopia, útil no TCE. Pode precipitar hipotensão no choque hemorrágico — reduza ou omita.',
 fonte:'Prática consolidada de SRI; ATLS não especifica dose de pré-tratamento'},

{cat:'via', nome:'Etomidato', apres:'2 mg/mL — ampola 10 mL',
 ataque:{txt:'0,3 mg/kg IV em bolus (0,15–0,2 mg/kg se instável)', min:0.3, max:0.3, un:'mg/kg'},
 manut:{txt:'não usar em infusão contínua'},
 nota:'Início em 15–45 s, duração de 3 a 12 min. Melhor estabilidade hemodinâmica entre os indutores.',
 alerta:'Supressão adrenal transitória mesmo em dose única — monitore no choque prolongado. Sem efeito analgésico: associe opioide.',
 fonte:'ATLS 10ª ed., p. 35'},

{cat:'via', nome:'Cetamina', sub:'indução', apres:'50 mg/mL — frasco 10 mL',
 ataque:{txt:'1–2 mg/kg IV (0,5–1 mg/kg se choque). IM: 4 mg/kg', min:1, max:2, un:'mg/kg'},
 manut:{txt:'0,5–1,5 mg/kg/h para sedação contínua', min:0.5, max:1.5, un:'mg/kg/h', base:'ajustado', dil:DIL.keta},
 nota:'Preserva o drive respiratório e o tônus vascular; broncodilatadora. Indutor de escolha no trauma instável e no broncoespasmo grave.',
 alerta:'No choque profundo o efeito simpaticomimético falha e pode haver depressão miocárdica direta — use a dose reduzida.',
 fonte:'Prática consolidada; ATLS cita sedativos sem especificar cetamina'},

{cat:'via', nome:'Midazolam', sub:'indução', apres:'5 mg/mL — ampola 3 mL e 10 mL',
 ataque:{txt:'0,1–0,3 mg/kg IV', min:0.1, max:0.3, un:'mg/kg', base:'ajustado'},
 manut:{txt:'0,02–0,1 mg/kg/h em infusão', min:0.02, max:0.1, un:'mg/kg/h', base:'ajustado', dil:DIL.mida},
 alerta:'Indutor ruim no trauma hemorrágico: hipotensão dose-dependente e início lento. Prefira cetamina ou etomidato.',
 fonte:'Prática consolidada'},

{cat:'via', nome:'Propofol', sub:'indução', apres:'10 mg/mL — frasco 20 mL e 100 mL',
 ataque:{txt:'1–2 mg/kg IV (0,5 mg/kg se instável)', min:1, max:2, un:'mg/kg', base:'ideal'},
 manut:{txt:'1–4 mg/kg/h', min:1, max:4, un:'mg/kg/h', base:'ajustado', dil:DIL.propo},
 alerta:'Vasodilatação e queda do débito — evite como indutor no choque não ressuscitado. Atenção à síndrome da infusão de propofol em doses altas e prolongadas.',
 fonte:'Prática consolidada'},

{cat:'via', nome:'Succinilcolina', sub:'bloqueio neuromuscular', apres:'pó 100 mg — reconstituir para 20 mg/mL',
 ataque:{txt:'1–2 mg/kg IV (dose habitual de 100 mg no adulto). IM: 3–4 mg/kg', min:1, max:2, un:'mg/kg'},
 manut:{txt:'não aplicável — duração de 5 a 10 min'},
 alerta:'Contraindicada com hipercalemia, queimadura ou lesão medular há mais de 48–72 h, esmagamento extenso, insuficiência renal crônica, paralisia crônica e doença neuromuscular. Na dúvida, use rocurônio.',
 fonte:'ATLS 10ª ed., p. 35'},

{cat:'via', nome:'Rocurônio', sub:'bloqueio neuromuscular', apres:'10 mg/mL — frasco 5 mL',
 ataque:{txt:'1,2 mg/kg IV para SRI (0,6 mg/kg em via aérea eletiva)', min:1.2, max:1.2, un:'mg/kg', base:'ideal'},
 manut:{txt:'0,3–0,6 mg/kg/h, ou bólus de 0,15 mg/kg', min:0.3, max:0.6, un:'mg/kg/h', base:'ideal', dil:DIL.rocu},
 nota:'Início em 45–60 s na dose de SRI; duração de 45 a 70 min.',
 alerta:'Paralisia prolongada em paciente sem sedação é dano evitável. Garanta sedação e analgesia contínuas.',
 fonte:'Prática consolidada'},

{cat:'via', nome:'Sugamadex', sub:'reversão do rocurônio', apres:'100 mg/mL — frasco 2 mL e 5 mL',
 ataque:{txt:'16 mg/kg IV para resgate imediato após SRI; 2–4 mg/kg para reversão de rotina', min:16, max:16, un:'mg/kg'},
 manut:{txt:'dose única'},
 alerta:'Reverter o bloqueio não resolve uma via aérea difícil — tenha o plano de resgate cirúrgico pronto.',
 fonte:'Bula do fabricante'},

{cat:'via', nome:'Atropina', sub:'bradicardia peri-intubação', apres:'0,25 mg/mL ou 0,5 mg/mL — ampola 1 mL',
 ataque:{txt:'0,02 mg/kg IV (mínimo 0,1 mg, máximo 0,5 mg na criança; 0,5–1 mg no adulto)', min:0.02, max:0.02, un:'mg/kg', piso:0.1, teto:1},
 manut:{txt:'repetir a cada 3–5 min, máximo de 3 mg no adulto'},
 nota:'Uso rotineiro na SRI não é recomendado; reserve para bradicardia estabelecida, sobretudo em lactentes.',
 fonte:'Prática consolidada'},

/* ---------- ANALGESIA E SEDAÇÃO ---------- */
{cat:'sed', nome:'Fentanil', sub:'analgesia contínua', apres:'50 mcg/mL',
 ataque:{txt:'1–2 mcg/kg IV, repetir conforme resposta', min:1, max:2, un:'mcg/kg', base:'ajustado'},
 manut:{txt:'0,5–3 mcg/kg/h em infusão', min:0.5, max:3, un:'mcg/kg/h', base:'ajustado', dil:DIL.fenta},
 nota:'Opioide de escolha no trauma: sem liberação histamínica e com menor impacto hemodinâmico que a morfina.',
 fonte:'Prática consolidada'},

{cat:'sed', nome:'Morfina', apres:'10 mg/mL — ampola 1 mL',
 ataque:{txt:'0,05–0,1 mg/kg IV, repetir a cada 5–10 min', min:0.05, max:0.1, un:'mg/kg', base:'ajustado'},
 manut:{txt:'0,01–0,05 mg/kg/h', min:0.01, max:0.05, un:'mg/kg/h', base:'ajustado', dil:DIL.morf},
 alerta:'Liberação de histamina e venodilatação podem agravar a hipotensão. Evite no choque não compensado.',
 fonte:'Prática consolidada'},

{cat:'sed', nome:'Cetamina', sub:'dose analgésica', apres:'50 mg/mL',
 ataque:{txt:'0,1–0,3 mg/kg IV em 10 min', min:0.1, max:0.3, un:'mg/kg'},
 manut:{txt:'0,1–0,3 mg/kg/h', min:0.1, max:0.3, un:'mg/kg/h', dil:DIL.keta},
 nota:'Poupa opioide e mantém a pressão. Boa opção na dor refratária do politraumatizado.',
 fonte:'Prática consolidada'},

{cat:'sed', nome:'Midazolam', sub:'sedação contínua', apres:'5 mg/mL',
 ataque:{txt:'0,02–0,05 mg/kg IV', min:0.02, max:0.05, un:'mg/kg', base:'ajustado'},
 manut:{txt:'0,02–0,1 mg/kg/h', min:0.02, max:0.1, un:'mg/kg/h', base:'ajustado', dil:DIL.mida},
 nota:'Acúmulo em infusão prolongada, sobretudo com disfunção renal ou hepática.',
 fonte:'Prática consolidada'},

{cat:'sed', nome:'Dexmedetomidina', apres:'100 mcg/mL — diluir antes de usar',
 ataque:{txt:'1 mcg/kg em 10 min — habitualmente omitida no trauma', min:1, max:1, un:'mcg/kg', base:'ajustado'},
 manut:{txt:'0,2–1,4 mcg/kg/h', min:0.2, max:1.4, un:'mcg/kg/h', base:'ajustado', dil:DIL.dex},
 alerta:'Bradicardia e hipotensão com a dose de ataque. Não serve como sedativo único em sedação profunda.',
 fonte:'Bula do fabricante'},

{cat:'sed', nome:'Dipirona', apres:'500 mg/mL — ampola 2 mL',
 ataque:{txt:'1–2 g IV lento, diluído em 10–20 mL'},
 manut:{txt:'1 g IV a cada 6 h'},
 nota:'Analgésico de base; associe opioide na dor moderada a intensa.',
 fonte:'Bula do fabricante'},

{cat:'sed', nome:'Paracetamol IV', apres:'10 mg/mL — frasco 100 mL',
 ataque:{txt:'1 g IV em 15 min (15 mg/kg se abaixo de 50 kg)', min:15, max:15, un:'mg/kg', teto:1000},
 manut:{txt:'1 g a cada 6 h — máximo de 4 g/dia, ou 3 g se hepatopatia'},
 fonte:'Bula do fabricante'},

/* ---------- HEMORRAGIA ---------- */
{cat:'hem', nome:'Ácido tranexâmico', sub:'TXA', apres:'50 mg/mL — ampola 5 mL',
 ataque:{txt:'1 g IV em 10 min, dentro de 3 h do trauma. Criança: 15 mg/kg (máx. 1 g)', min:15, max:15, un:'mg/kg', teto:1000},
 manut:{txt:'1 g IV em infusão de 8 h. Criança: 2 mg/kg/h por 8 h', min:2, max:2, un:'mg/kg/h'},
 nota:'CRASH-2: reduz mortalidade no trauma com hemorragia. CRASH-3: mesma posologia no TCE com Glasgow 9–15, dentro de 3 h.',
 alerta:'Iniciar após 3 h do trauma pode aumentar a mortalidade por sangramento. Infusão rápida causa hipotensão.',
 fonte:'ATLS 10ª ed., p. 56; CRASH-2 e CRASH-3'},

{cat:'hem', nome:'Gluconato de cálcio 10%', apres:'ampola 10 mL = 1 g = 4,6 mEq de cálcio',
 ataque:{txt:'1–3 g IV lento, 10–30 mL. Criança: 0,2–0,5 mL/kg', min:0.2, max:0.5, un:'mL/kg', teto:30},
 manut:{txt:'guiar pelo cálcio ionizado — alvo acima de 1,1 mmol/L'},
 nota:'O citrato dos hemocomponentes quela o cálcio. A hipocalcemia fecha o ciclo com acidose, hipotermia e coagulopatia.',
 alerta:'O ATLS não recomenda reposição rotineira por número de bolsas: a maioria dos transfundidos não precisa de cálcio, e a suplementação excessiva é nociva. Guie pelo cálcio ionizado. Não infunda na mesma via que Ringer lactato ou bicarbonato.',
 fonte:'ATLS 10ª ed., p. 56'},

{cat:'hem', nome:'Cloreto de cálcio 10%', apres:'ampola 10 mL = 1 g = 13,6 mEq de cálcio',
 ataque:{txt:'0,5–1 g IV lento, 5–10 mL, preferencialmente em acesso central'},
 manut:{txt:'guiar pelo cálcio ionizado'},
 alerta:'Três vezes mais cálcio elementar que o gluconato e altamente irritante — extravasamento causa necrose.',
 fonte:'ATLS 10ª ed., p. 56'},

{cat:'hem', nome:'Complexo protrombínico', sub:'CCP — reversão de varfarina', apres:'frasco 500 UI e 1000 UI',
 ataque:{txt:'25–50 UI/kg IV conforme INR e produto', min:25, max:50, un:'U/kg'},
 manut:{txt:'dose única; reavaliar INR em 30 min'},
 alerta:'Sempre associar vitamina K: o efeito do CCP dura 6 a 8 h e o da varfarina, dias.',
 fonte:'ATLS 10ª ed., cap. 6 (tabela de reversão de anticoagulantes)'},

{cat:'hem', nome:'Vitamina K', sub:'fitomenadiona', apres:'10 mg/mL — ampola 1 mL',
 ataque:{txt:'5–10 mg IV lento, diluído, em 20–30 min'},
 manut:{txt:'repetir a cada 12–24 h conforme INR'},
 alerta:'Risco de reação anafilactoide com infusão rápida.',
 fonte:'ATLS 10ª ed., cap. 6'},

{cat:'hem', nome:'Idarucizumabe', sub:'reversão da dabigatrana', apres:'50 mg/mL — 2 frascos de 2,5 g',
 ataque:{txt:'5 g IV, em dois bólus consecutivos de 2,5 g'},
 manut:{txt:'dose única; repetir 5 g se o sangramento recorrer'},
 fonte:'ATLS 10ª ed., cap. 6'},

{cat:'hem', nome:'Protamina', sub:'reversão de heparina', apres:'10 mg/mL — ampola 5 mL',
 ataque:{txt:'1 mg para cada 100 UI de heparina das últimas 2–3 h — máximo de 50 mg por dose'},
 manut:{txt:'reavaliar TTPa'},
 alerta:'Infusão rápida causa hipotensão grave, bradicardia e reação anafilática.',
 fonte:'Bula do fabricante'},

{cat:'hem', nome:'Fibrinogênio', sub:'ou crioprecipitado', apres:'concentrado de fibrinogênio ou crioprecipitado',
 ataque:{txt:'3–4 g de fibrinogênio, ou 10 unidades de crioprecipitado, se fibrinogênio abaixo de 150 mg/dL'},
 manut:{txt:'repetir guiado por tromboelastometria ou fibrinogênio sérico'},
 fonte:'ATLS 10ª ed., p. 56 (uso guiado por TEG/ROTEM)'},

{cat:'hem', nome:'Protocolo de transfusão maciça', sub:'não é fármaco — é a prioridade',
 ataque:{txt:'Hemácias, plasma e plaquetas em baixa proporção entre si (próxima de 1:1:1), iniciados precocemente nas hemorragias classes III e IV'},
 manut:{txt:'reavaliar a cada ciclo com gasometria, cálcio ionizado e coagulograma'},
 nota:'Alvos: temperatura acima de 35 °C, cálcio ionizado acima de 1,1 mmol/L, pH acima de 7,2.',
 alerta:'Cristaloide em excesso dilui fatores e piora a coagulopatia. Sangue precoce vence volume.',
 fonte:'ATLS 10ª ed., p. 53'},

/* ---------- CHOQUE E PCR ---------- */
{cat:'circ', nome:'Cristaloide balanceado', sub:'Ringer lactato', apres:'bolsa 500 mL e 1000 mL',
 ataque:{txt:'Adulto: 1 L aquecido. Criança abaixo de 40 kg: 20 mL/kg', min:20, max:20, un:'mL/kg', teto:1000},
 manut:{txt:'não repetir indefinidamente — passar a hemocomponentes se a resposta não for sustentada'},
 nota:'Hipotensão permissiva com PAS de 80 a 90 mmHg até o controle cirúrgico do sangramento.',
 alerta:'A hipotensão permissiva não vale para TCE, onde o alvo é PAS de pelo menos 110 mmHg, nem para lesão medular. A infusão contínua de grandes volumes não substitui o controle definitivo da hemorragia.',
 fonte:'ATLS 10ª ed., p. 52'},

{cat:'circ', nome:'Noradrenalina', apres:'2 mg/mL — ampola 4 mL',
 ataque:{txt:'sem dose de ataque — iniciar em 0,05 mcg/kg/min', min:0.05, max:0.05, un:'mcg/kg/min', dil:DIL.nora},
 manut:{txt:'0,05–1 mcg/kg/min, titulada pela pressão arterial média', min:0.05, max:1, un:'mcg/kg/min', dil:DIL.nora},
 alerta:'No choque hemorrágico, vasopressor não substitui sangue. Aumentar a resistência periférica sem corrigir o débito eleva a pressão sem melhorar a perfusão tecidual.',
 fonte:'ATLS 10ª ed., p. 56 (ressalva sobre vasopressores)'},

{cat:'circ', nome:'Adrenalina', apres:'1 mg/mL — ampola 1 mL',
 ataque:{txt:'PCR: 1 mg IV a cada 3–5 min. Criança: 0,01 mg/kg. Anafilaxia: 0,3–0,5 mg IM', min:0.01, max:0.01, un:'mg/kg', teto:1},
 manut:{txt:'0,05–0,5 mcg/kg/min em infusão', min:0.05, max:0.5, un:'mcg/kg/min', dil:DIL.adre},
 nota:'Na PCR traumática a prioridade é reverter a causa: hipovolemia, pneumotórax hipertensivo, tamponamento e hipóxia.',
 fonte:'ACLS/AHA; ATLS cap. 3'},

{cat:'circ', nome:'Vasopressina', apres:'20 U/mL — ampola 1 mL',
 ataque:{txt:'sem dose de ataque no uso habitual'},
 manut:{txt:'0,03–0,04 U/min em dose fixa, sem titulação por peso', min:0.03, max:0.04, un:'U/min', dil:DIL.vaso},
 nota:'Poupador de catecolamina no choque refratário. A dose é fixa e independe do peso.',
 fonte:'Prática consolidada em terapia intensiva'},

{cat:'circ', nome:'Bicarbonato de sódio 8,4%', apres:'ampola 10 mL = 10 mEq',
 ataque:{txt:'1 mEq/kg IV', min:1, max:1, un:'mEq/kg'},
 manut:{txt:'guiar por gasometria; repetir 0,5 mEq/kg se necessário', min:0.5, max:0.5, un:'mEq/kg'},
 alerta:'O ATLS afirma que o bicarbonato não deve ser usado para tratar a acidose metabólica do choque hipovolêmico. Reserve para hipercalemia com alteração no ECG, esmagamento e acidose grave refratária.',
 fonte:'ATLS 10ª ed., p. 54'},

{cat:'circ', nome:'Amiodarona', apres:'50 mg/mL — ampola 3 mL',
 ataque:{txt:'PCR em FV ou TV sem pulso: 300 mg IV, seguida de 150 mg. Taquiarritmia estável: 150 mg em 10 min'},
 manut:{txt:'1 mg/min por 6 h, depois 0,5 mg/min por 18 h'},
 fonte:'ACLS/AHA'},

/* ---------- TCE E CONVULSÃO ---------- */
{cat:'neuro', nome:'Salina hipertônica 3%', apres:'bolsa 250 mL e 500 mL',
 ataque:{txt:'3–5 mL/kg IV em 15–20 min (250–500 mL no adulto)', min:3, max:5, un:'mL/kg'},
 manut:{txt:'infusão guiada pelo sódio sérico — alvo de 145 a 155 mEq/L'},
 nota:'Concentrações de 3% a 23,4% são usadas. Pode ser preferida no hipotenso porque não age como diurético.',
 alerta:'Não há diferença comprovada entre manitol e salina hipertônica na redução da PIC, e nenhuma das duas reduz a PIC adequadamente no hipovolêmico. Monitore o sódio a cada 4–6 h.',
 fonte:'ATLS 10ª ed., cap. 6'},

{cat:'neuro', nome:'Salina hipertônica 20%', sub:'resgate de herniação', apres:'ampola 10 mL e 20 mL',
 ataque:{txt:'30 mL IV em bólus, preferencialmente em acesso central'},
 manut:{txt:'dose única de resgate; seguir com hipertônica 3% ou manitol'},
 alerta:'Flebite grave em veia periférica.',
 fonte:'Prática consolidada em neurointensivismo'},

{cat:'neuro', nome:'Manitol 20%', apres:'frasco 250 mL — 20 g por 100 mL',
 ataque:{txt:'Herniação iminente: 1 g/kg IV em bólus rápido, cerca de 5 min. Controle da PIC: 0,25–1 g/kg', min:0.25, max:1, un:'g/kg'},
 manut:{txt:'repetir em bólus, não em gotejamento contínuo, mantendo osmolaridade abaixo de 320 mOsm', min:0.25, max:1, un:'g/kg'},
 alerta:'Não administrar ao hipotenso: não reduz a PIC na hipovolemia e, como diurético osmótico potente, agrava a hipotensão. Exige normovolemia e PAS acima de 90 mmHg.',
 fonte:'ATLS 10ª ed., cap. 6'},

{cat:'neuro', nome:'Fenitoína', sub:'profilaxia de crise pós-traumática', apres:'50 mg/mL — ampola 5 mL',
 ataque:{txt:'15–20 mg/kg IV, velocidade máxima de 50 mg/min', min:15, max:20, un:'mg/kg'},
 manut:{txt:'5 mg/kg/dia, dividido a cada 8 h', min:5, max:5, un:'mg/kg'},
 nota:'Profilaxia por 7 dias reduz crises precoces no TCE grave, sem alterar as tardias.',
 alerta:'Diluir apenas em soro fisiológico; precipita em glicose. Infusão rápida causa hipotensão e arritmia. Extravasamento provoca síndrome da luva roxa.',
 fonte:'ATLS 10ª ed., cap. 6'},

{cat:'neuro', nome:'Levetiracetam', apres:'100 mg/mL — frasco 5 mL',
 ataque:{txt:'20 mg/kg IV em 15 min (1000–1500 mg no adulto)', min:20, max:20, un:'mg/kg', teto:3000},
 manut:{txt:'500–1000 mg IV a cada 12 h'},
 nota:'Alternativa à fenitoína, com menos interações, sem necessidade de nível sérico e sem risco de hipotensão.',
 fonte:'Prática consolidada; alternativa citada no ATLS cap. 6'},

{cat:'neuro', nome:'Midazolam', sub:'crise convulsiva em curso', apres:'5 mg/mL',
 ataque:{txt:'0,2 mg/kg IV, máximo de 10 mg. IM: 10 mg se não houver acesso venoso', min:0.2, max:0.2, un:'mg/kg', teto:10},
 manut:{txt:'0,05–2 mg/kg/h no estado de mal refratário', min:0.05, max:2, un:'mg/kg/h', dil:DIL.mida},
 alerta:'Prepare a via aérea antes: depressão respiratória é esperada nas doses altas.',
 fonte:'Prática consolidada'},

/* ---------- ANTIBIÓTICOS E TÉTANO ---------- */
{cat:'inf', nome:'Cefazolina', sub:'fratura exposta Gustilo I e II', apres:'frasco 1 g',
 ataque:{txt:'2 g IV o quanto antes (3 g se acima de 120 kg). Criança: 30 mg/kg', min:30, max:30, un:'mg/kg', teto:2000},
 manut:{txt:'2 g IV a cada 8 h, por 24 a 72 h após o fechamento'},
 nota:'A primeira dose deve sair na primeira hora: o tempo até o antibiótico pesa mais que o esquema escolhido.',
 fonte:'Protocolos de fratura exposta; ATLS cap. 8'},

{cat:'inf', nome:'Gentamicina', sub:'associar na Gustilo III', apres:'40 mg/mL — ampola 1,5 mL e 2 mL',
 ataque:{txt:'5–7 mg/kg IV em dose única diária', min:5, max:7, un:'mg/kg', base:'ajustado'},
 manut:{txt:'mesma dose a cada 24 h, ajustada à função renal'},
 alerta:'Nefro e ototoxicidade; evite com rabdomiólise ou lesão renal aguda.',
 fonte:'Protocolos de fratura exposta'},

{cat:'inf', nome:'Ceftriaxona', apres:'frasco 1 g',
 ataque:{txt:'2 g IV'},
 manut:{txt:'2 g IV a cada 24 h'},
 nota:'Alternativa em ferimentos contaminados e em TCE com fístula liquórica.',
 fonte:'Prática consolidada'},

{cat:'inf', nome:'Metronidazol', sub:'contaminação por solo ou fezes', apres:'5 mg/mL — bolsa 100 mL',
 ataque:{txt:'500 mg IV'},
 manut:{txt:'500 mg IV a cada 8 h'},
 fonte:'Prática consolidada'},

{cat:'inf', nome:'Penicilina cristalina', sub:'risco de clostrídio', apres:'frasco 5 milhões UI',
 ataque:{txt:'4 milhões UI IV'},
 manut:{txt:'4 milhões UI IV a cada 4 h'},
 nota:'Indicada em ferimento de fazenda, contato com solo ou material fecal.',
 fonte:'Prática consolidada'},

{cat:'inf', nome:'Vacina dT ou dTpa', sub:'profilaxia antitetânica', apres:'0,5 mL — seringa ou frasco',
 ataque:{txt:'0,5 mL IM no deltoide'},
 manut:{txt:'completar o esquema em 2 e 6 meses se o histórico for incompleto'},
 nota:'Indicada se a última dose foi há mais de 5 anos em ferimento sujo, ou há mais de 10 anos em ferimento limpo.',
 fonte:'Ministério da Saúde; ATLS cap. 8'},

{cat:'inf', nome:'Imunoglobulina antitetânica', sub:'IGHAT', apres:'frasco 250 UI',
 ataque:{txt:'250 UI IM (500 UI se ferimento extenso, contaminado ou com mais de 24 h)'},
 manut:{txt:'dose única, em local diferente da vacina'},
 nota:'Indicada em ferimento de alto risco quando o esquema vacinal é incompleto, desconhecido ou o paciente é imunodeprimido.',
 fonte:'Ministério da Saúde'},

/* ---------- SITUAÇÕES ESPECIAIS ---------- */
{cat:'esp', nome:'Reposição na queimadura', sub:'consenso ABA', apres:'Ringer lactato',
 ataque:{txt:'Adulto: 2 mL × peso × % de superfície queimada nas primeiras 24 h. Criança: 3 mL/kg/%. Queimadura elétrica: 4 mL/kg/%'},
 manut:{txt:'metade do volume nas primeiras 8 h contadas da hora da queimadura; o restante nas 16 h seguintes'},
 formula:'queimadura',
 nota:'Titule pela diurese: 0,5 mL/kg/h no adulto e 1 mL/kg/h na criança abaixo de 30 kg. Crianças abaixo de 30 kg recebem ainda manutenção com glicose 5% em Ringer lactato.',
 alerta:'A fórmula estima apenas a necessidade inicial. Reduza a velocidade pelo débito urinário, nunca pela metade de uma vez. Evite bólus, exceto se houver hipotensão.',
 fonte:'ATLS 10ª ed., p. 173'},

{cat:'esp', nome:'Naloxona', apres:'0,4 mg/mL — ampola 1 mL',
 ataque:{txt:'0,04–0,4 mg IV, repetir a cada 2–3 min até resposta ventilatória, máximo de 2 mg'},
 manut:{txt:'infusão de dois terços da dose efetiva por hora, se opioide de meia-vida longa'},
 alerta:'Titule pela ventilação, não pelo nível de consciência: a reversão abrupta gera dor intensa, agitação e abstinência no politraumatizado.',
 fonte:'Prática consolidada'},

{cat:'esp', nome:'Insulina regular com glicose', sub:'hipercalemia do esmagamento', apres:'100 U/mL',
 ataque:{txt:'10 U IV com 25 g de glicose (50 mL de glicose a 50%)'},
 manut:{txt:'repetir conforme o potássio; monitorar glicemia por 4 a 6 h'},
 alerta:'Na síndrome de esmagamento, trate a hipercalemia antes de liberar o membro comprimido. Hipoglicemia tardia é comum.',
 fonte:'Prática consolidada'},

{cat:'esp', nome:'Sulfato de magnésio', apres:'10% ou 50% — ampola 10 mL',
 ataque:{txt:'1–2 g IV em 15–20 min'},
 manut:{txt:'1 g/h conforme nível sérico e função renal'},
 nota:'Útil em torsades de pointes e na hipomagnesemia da transfusão maciça.',
 fonte:'Prática consolidada'},

{cat:'esp', nome:'Hidrocortisona', sub:'choque refratário', apres:'frasco 100 mg e 500 mg',
 ataque:{txt:'100 mg IV'},
 manut:{txt:'200 mg/dia, em infusão contínua ou 50 mg a cada 6 h'},
 nota:'Considerar quando o choque persiste apesar de volume adequado e dose alta de vasopressor.',
 fonte:'Prática consolidada em terapia intensiva'},

/* ============================================================
   SÍNDROME CORONARIANA AGUDA
   ============================================================ */
{cat:'sca', nome:'AAS', sub:'ácido acetilsalicílico', apres:'comprimido 100 mg e 300 mg',
 ataque:{txt:'160–325 mg VO, mastigados, assim que houver suspeita'},
 manut:{txt:'100 mg VO ao dia, indefinidamente'},
 nota:'Primeira medida farmacológica na suspeita de SCA. Mastigar acelera a absorção.',
 fonte:'Mapa de estudo GT-01 — confirmar com diretriz da SBC antes de uso clínico'},

{cat:'sca', nome:'Clopidogrel', sub:'inibidor de P2Y12', apres:'comprimido 75 mg',
 ataque:{txt:'600 mg VO se angioplastia; 300 mg VO na estratégia conservadora. Acima de 75 anos em trombólise: sem dose de ataque'},
 manut:{txt:'75 mg VO ao dia'},
 nota:'É o único inibidor de P2Y12 liberado junto com trombolítico.',
 alerta:'Não iniciar inibidor de P2Y12 em paciente instável, de alto risco ou com cateterismo imediato previsto: há chance de cirurgia de revascularização e risco de sangramento.',
 fonte:'Mapa de estudo GT-01 — confirmar com diretriz da SBC antes de uso clínico'},

{cat:'sca', nome:'Ticagrelor', sub:'inibidor de P2Y12', apres:'comprimido 90 mg',
 ataque:{txt:'180 mg VO'},
 manut:{txt:'90 mg VO a cada 12 h'},
 alerta:'Contraindicado com trombólise. Causa dispneia e bradiarritmia em parte dos pacientes.',
 fonte:'Mapa de estudo GT-01 — confirmar com diretriz da SBC antes de uso clínico'},

{cat:'sca', nome:'Prasugrel', sub:'inibidor de P2Y12', apres:'comprimido 10 mg',
 ataque:{txt:'60 mg VO, apenas depois da anatomia coronariana conhecida'},
 manut:{txt:'10 mg VO ao dia (5 mg se acima de 75 anos ou abaixo de 60 kg)'},
 alerta:'Contraindicado com trombólise e com AVC ou AIT prévio. Evitar acima de 75 anos e abaixo de 60 kg.',
 fonte:'Mapa de estudo GT-01 — confirmar com diretriz da SBC antes de uso clínico'},

{cat:'sca', nome:'Enoxaparina', sub:'anticoagulação na SCA', apres:'seringa 20, 40, 60, 80 e 100 mg',
 ataque:{txt:'1 mg/kg SC a cada 12 h. Com trombólise, abaixo de 75 anos: 30 mg IV em bólus seguidos de 1 mg/kg SC', min:1, max:1, un:'mg/kg'},
 manut:{txt:'1 mg/kg SC a cada 12 h (0,75 mg/kg se acima de 75 anos; 1 mg/kg a cada 24 h se clearance abaixo de 30 mL/min)', min:1, max:1, un:'mg/kg'},
 nota:'Anticoagulante preferido quando se usa trombolítico. Mantida por 48 h a 8 dias após a trombólise no IAM com supra.',
 fonte:'Mapa de estudo GT-01 — confirmar com diretriz da SBC antes de uso clínico'},

{cat:'sca', nome:'Heparina não fracionada', apres:'5000 UI/mL — frasco 5 mL',
 ataque:{txt:'60 UI/kg IV em bólus, máximo de 4000 UI', min:60, max:60, un:'U/kg', teto:4000},
 manut:{txt:'12 UI/kg/h em infusão, máximo inicial de 1000 UI/h, ajustada pelo TTPa', min:12, max:12, un:'U/kg/h'},
 nota:'Preferida na disfunção renal grave e quando se antecipa cateterismo imediato.',
 fonte:'Mapa de estudo GT-01 — confirmar com diretriz da SBC antes de uso clínico'},

{cat:'sca', nome:'Nitroglicerina', sub:'nitrato IV', apres:'5 mg/mL — ampola 10 mL',
 ataque:{txt:'sem bólus — iniciar a infusão em 5–10 mcg/min'},
 manut:{txt:'5–200 mcg/min, titulados pela dor e pela pressão', min:5, max:200, un:'mcg/min', dil:DIL.ntg},
 alerta:'Contraindicada com uso de inibidor de fosfodiesterase nas últimas 24 a 48 h, hipotensão, e infarto de ventrículo direito, onde pode causar colapso por queda abrupta da pré-carga.',
 fonte:'Prática consolidada'},

{cat:'sca', nome:'Morfina', sub:'dor refratária na SCA', apres:'10 mg/mL — ampola 1 mL',
 ataque:{txt:'2–4 mg IV, repetir a cada 5–15 min se a dor persistir'},
 manut:{txt:'evitar uso contínuo'},
 alerta:'Reduz a absorção dos inibidores de P2Y12 e associa-se a pior desfecho em estudos observacionais. Use apenas na dor refratária ao nitrato.',
 fonte:'Prática consolidada'},

{cat:'sca', nome:'Tenecteplase', sub:'trombólise no IAM com supra', apres:'frasco 50 mg — reconstituir',
 ataque:{txt:'Bólus único IV ajustado ao peso: abaixo de 60 kg, 30 mg; 60–69 kg, 35 mg; 70–79 kg, 40 mg; 80–89 kg, 45 mg; 90 kg ou mais, 50 mg. Metade da dose se 75 anos ou mais'},
 manut:{txt:'dose única, sempre com anticoagulação associada'},
 formula:'tnk',
 nota:'Indicada quando a angioplastia primária não é possível em até 120 min do primeiro contato médico, dentro de 12 h do início dos sintomas.',
 alerta:'Rastrear contraindicações absolutas antes: AVC hemorrágico prévio, AVC isquêmico nos últimos 6 meses, neoplasia ou malformação do sistema nervoso central, sangramento ativo, dissecção de aorta e trauma craniano recente.',
 fonte:'Mapa de estudo GT-01 — confirmar com diretriz da SBC antes de uso clínico'},

{cat:'sca', nome:'Atorvastatina', sub:'estabilização de placa', apres:'comprimido 40 mg e 80 mg',
 ataque:{txt:'80 mg VO, nas primeiras 24 h, independentemente do LDL basal'},
 manut:{txt:'40–80 mg VO ao dia — alvo de LDL abaixo de 50 mg/dL'},
 fonte:'Mapa de estudo GT-01 — confirmar com diretriz da SBC antes de uso clínico'},

/* ============================================================
   ASMA E BRONCOESPASMO
   ============================================================ */
{cat:'resp', nome:'Salbutamol spray', sub:'beta-2 de curta duração', apres:'100 mcg por jato',
 ataque:{txt:'4–8 jatos com espaçador a cada 20 min, por 3 doses na primeira hora'},
 manut:{txt:'4–8 jatos a cada 1 a 4 h, conforme a resposta'},
 nota:'Com espaçador, o spray equivale à nebulização e tem menos efeito adverso.',
 fonte:'Guia do Episódio de Cuidado — Exacerbação Asmática em Adultos, rev. 2024'},

{cat:'resp', nome:'Salbutamol nebulização', apres:'5 mg/mL — frasco',
 ataque:{txt:'2,5–5 mg (10 a 20 gotas) a cada 20 min, por 3 doses'},
 manut:{txt:'nebulização contínua de 10–15 mg/h nos casos graves'},
 fonte:'Guia do Episódio de Cuidado — Exacerbação Asmática em Adultos, rev. 2024'},

{cat:'resp', nome:'Salbutamol injetável', sub:'resgate na asma quase fatal', apres:'0,5 mg/mL',
 ataque:{txt:'200 mcg IV em 10 min'},
 manut:{txt:'3–12 mcg/min em infusão', min:3, max:12, un:'mcg/min', dil:DIL.salbiv},
 alerta:'Exige monitorização em terapia intensiva: taquiarritmia, hipocalemia e acidose láctica.',
 fonte:'Guia do Episódio de Cuidado — Exacerbação Asmática em Adultos, rev. 2024'},

{cat:'resp', nome:'Brometo de ipratrópio', sub:'anticolinérgico', apres:'spray 20 mcg/jato; solução 0,25 mg/mL',
 ataque:{txt:'Spray: 4–8 jatos a cada 20 min, por 3 doses. Nebulização: 0,5 mg (40 gotas) a cada 20 min, por 3 doses'},
 manut:{txt:'a cada 2 a 4 h'},
 nota:'Associar ao beta-2 nas exacerbações graves e nas que não respondem à primeira hora.',
 fonte:'Guia do Episódio de Cuidado — Exacerbação Asmática em Adultos, rev. 2024'},

{cat:'resp', nome:'Prednisona ou prednisolona', apres:'comprimido 5, 20 e 40 mg',
 ataque:{txt:'1 mg/kg VO, máximo de 60 mg', min:1, max:1, un:'mg/kg', teto:60},
 manut:{txt:'40–60 mg ao dia, por 3 a 10 dias, sem necessidade de desmame'},
 nota:'Iniciar na primeira hora se não houver resposta rápida ao broncodilatador.',
 fonte:'Guia do Episódio de Cuidado — Exacerbação Asmática em Adultos, rev. 2024'},

{cat:'resp', nome:'Metilprednisolona', sub:'corticoide IV', apres:'frasco 125 mg e 500 mg',
 ataque:{txt:'40–80 mg IV'},
 manut:{txt:'60–80 mg a cada 6 a 12 h nos pacientes que precisam de terapia intensiva'},
 fonte:'Guia do Episódio de Cuidado — Exacerbação Asmática em Adultos, rev. 2024'},

{cat:'resp', nome:'Hidrocortisona', sub:'alternativa IV', apres:'frasco 100 mg e 500 mg',
 ataque:{txt:'2–3 mg/kg IV', min:2, max:3, un:'mg/kg'},
 manut:{txt:'2–3 mg/kg a cada 4 h', min:2, max:3, un:'mg/kg'},
 fonte:'Guia do Episódio de Cuidado — Exacerbação Asmática em Adultos, rev. 2024'},

{cat:'resp', nome:'Sulfato de magnésio', sub:'asma grave', apres:'50% — ampola 10 mL',
 ataque:{txt:'2 g (4 mL da solução a 50%) diluídos em 50 mL de SF, infundidos em mais de 20 min'},
 manut:{txt:'pode repetir após 20 min'},
 nota:'Indicado na exacerbação grave ou com risco de vida que não responde à primeira hora de tratamento.',
 fonte:'Guia do Episódio de Cuidado — Exacerbação Asmática em Adultos, rev. 2024'},

/* ============================================================
   PNEUMONIA ADQUIRIDA NA COMUNIDADE
   ============================================================ */
{cat:'pac', nome:'Amoxicilina', sub:'PAC ambulatorial', apres:'comprimido 500 mg',
 ataque:{txt:'500 mg VO'},
 manut:{txt:'500 mg VO a cada 8 h, por 4 a 7 dias sem comorbidade, ou 7 dias com comorbidade'},
 nota:'Primeira escolha no paciente sem comorbidade e sem antibiótico nos últimos 3 meses.',
 fonte:'Guia Einstein — Manejo da PAC em Adultos, v4 (2025)'},

{cat:'pac', nome:'Amoxicilina com clavulanato', sub:'PAC ambulatorial', apres:'comprimido 875/125 mg',
 ataque:{txt:'875/125 mg VO'},
 manut:{txt:'875/125 mg VO a cada 12 h, por 4 a 7 dias'},
 fonte:'Guia Einstein — Manejo da PAC em Adultos, v4 (2025)'},

{cat:'pac', nome:'Azitromicina', sub:'cobertura de atípicos', apres:'comprimido 500 mg',
 ataque:{txt:'500 mg VO'},
 manut:{txt:'500 mg VO a cada 24 h, por 5 dias'},
 nota:'Associar ao betalactâmico quando há comorbidade ou uso recente de antibiótico.',
 fonte:'Guia Einstein — Manejo da PAC em Adultos, v4 (2025)'},

{cat:'pac', nome:'Claritromicina', sub:'cobertura de atípicos', apres:'comprimido 500 mg; frasco IV 500 mg',
 ataque:{txt:'500 mg VO ou IV'},
 manut:{txt:'500 mg a cada 12 h, por 7 dias'},
 fonte:'Guia Einstein — Manejo da PAC em Adultos, v4 (2025)'},

{cat:'pac', nome:'Ceftriaxona', sub:'PAC internado', apres:'frasco 1 g',
 ataque:{txt:'1 g IV'},
 manut:{txt:'1 g IV a cada 12 h, associada a macrolídeo'},
 fonte:'Guia Einstein — Manejo da PAC em Adultos, v4 (2025)'},

{cat:'pac', nome:'Levofloxacino', sub:'alergia a betalactâmico', apres:'comprimido 500 e 750 mg; bolsa IV',
 ataque:{txt:'750 mg VO ou IV (500 mg em regime ambulatorial)'},
 manut:{txt:'750 mg a cada 24 h, por 7 dias'},
 nota:'Monoterapia que cobre típicos e atípicos.',
 alerta:'Prolonga o intervalo QT e pode mascarar tuberculose. Evite como primeira escolha quando houver alternativa.',
 fonte:'Guia Einstein — Manejo da PAC em Adultos, v4 (2025)'},

{cat:'pac', nome:'Piperacilina com tazobactam', sub:'risco de Pseudomonas', apres:'frasco 4,5 g',
 ataque:{txt:'4,5 g IV'},
 manut:{txt:'4,5 g IV a cada 6 h, associada a macrolídeo'},
 nota:'Indicada com DPOC com fator de risco para Pseudomonas, bronquiectasia, uso frequente de antibiótico ou corticoide.',
 fonte:'Guia Einstein — Manejo da PAC em Adultos, v4 (2025)'},

{cat:'pac', nome:'Cefepime', sub:'risco de Pseudomonas', apres:'frasco 1 g e 2 g',
 ataque:{txt:'2 g IV'},
 manut:{txt:'2 g IV a cada 8 h, associado a macrolídeo'},
 fonte:'Guia Einstein — Manejo da PAC em Adultos, v4 (2025)'},

{cat:'pac', nome:'Meropenem', sub:'paciente oncológico', apres:'frasco 500 mg e 1 g',
 ataque:{txt:'1 g IV (2 g no choque séptico)'},
 manut:{txt:'1 a 2 g IV a cada 8 h'},
 nota:'Indicado no paciente oncológico com sepse e internação nos últimos 3 meses, ou em choque séptico.',
 fonte:'Guia Einstein — Manejo da PAC em Adultos, v4 (2025)'},

{cat:'pac', nome:'Vancomicina', sub:'choque séptico em oncológico', apres:'frasco 500 mg e 1 g',
 ataque:{txt:'30 mg/kg IV na dose de ataque', min:30, max:30, un:'mg/kg'},
 manut:{txt:'1 g IV a cada 12 h, ajustada por vancocinemia'},
 fonte:'Guia Einstein — Manejo da PAC em Adultos, v4 (2025)'},

{cat:'pac', nome:'Hidrocortisona', sub:'corticoide na PAC grave', apres:'frasco 100 mg e 500 mg',
 ataque:{txt:'não há dose de ataque definida'},
 manut:{txt:'200 mg/dia IV, contínuos ou a cada 6 h, por 4 a 7 dias'},
 nota:'Indicada no imunocompetente com insuficiência respiratória que precisa de ventilação mecânica, ou com PaO₂/FiO₂ abaixo de 300 e FiO₂ de 50% ou mais. Alternativa: metilprednisolona 40 mg/dia.',
 fonte:'Guia Einstein — Manejo da PAC em Adultos, v4 (2025)'}
];

/* ============================================================
   PROTOCOLOS
   ============================================================ */
const PROTOCOLOS = [

{id:'xabcde', cat:'via', nome:'Avaliação primária', sub:'XABCDE',
 fonte:'ATLS 10ª ed., cap. 1 a 3',
 intro:'Sequência fixa. Só avance quando o item anterior estiver resolvido — achou o problema, trate na hora.',
 etapas:[
  {t:'X — Hemorragia exsanguinante',
   d:'Compressão direta firme. Sangramento de membro que não cede: <b>torniquete</b> acima da lesão, apertado até o sangramento parar e o pulso distal sumir. Anote a hora. Junção (axila, virilha, pescoço): curativo hemostático com compressão sustentada.',
   alerta:'Torniquete frouxo sangra mais que torniquete nenhum, porque bloqueia só o retorno venoso. Se não parou, aperte mais ou coloque um segundo ao lado.'},
  {t:'A — Via aérea com proteção cervical',
   d:'Pergunte o nome: quem responde com voz clara tem via aérea pérvia. Aspire sangue e secreção, retire corpo estranho, eleve o mento ou tracione a mandíbula, use cânula orofaríngea no inconsciente. Estabilização cervical manual em linha desde o primeiro contato.',
   d2:'<b>Indicações de via aérea definitiva:</b> Glasgow de 8 ou menos, apneia, obstrução que não cede, trauma de face grave, queimadura de via aérea (rouquidão, estridor, escarro carbonáceo), incapacidade de manter oxigenação ou de proteger contra aspiração.'},
  {t:'B — Ventilação e oxigenação',
   d:'Exponha o tórax. Frequência, expansibilidade simétrica, ausculta nos ápices e bases, palpe crepitação, oximetria e capnografia. Oxigênio suplementar para manter saturação <b>acima de 95%</b>.',
   d2:'Procure ativamente as lesões que matam agora: <b>pneumotórax hipertensivo</b>, pneumotórax aberto, hemotórax maciço e tórax instável com contusão pulmonar.'},
  {t:'C — Circulação',
   d:'Dois acessos venosos periféricos <b>curtos e calibrosos, calibre mínimo 18G</b>, nas fossas antecubitais. Se não conseguir, intraósseo. Colha na punção tipagem, provas cruzadas, gasometria, hemograma, coagulograma, toxicológico e beta-HCG em toda mulher em idade fértil.',
   d2:'Busque o sangue nos cinco lugares: <b>tórax, abdome, retroperitônio e pelve, ossos longos e o chão</b>. FAST e radiografias de tórax e pelve. Cinta pélvica ou lençol se houver instabilidade.',
   doses:[{n:'Ácido tranexâmico', txt:'ataque em 10 min, até 3 h do trauma', min:15, max:15, un:'mg/kg', teto:1000}]},
  {t:'D — Estado neurológico',
   d:'Escala de Glasgow, pupilas, déficit motor lateralizado e nível sensitivo. <b>Glicemia capilar em todo rebaixamento de consciência.</b>',
   alerta:'Alteração do sistema nervoso central no choque pode refletir apenas perfusão cerebral inadequada, não lesão intracraniana. Repita o exame neurológico depois de restaurar perfusão e oxigenação.'},
  {t:'E — Exposição e controle térmico',
   d:'Dispa completamente, faça o rolamento em bloco e examine o dorso, o períneo e as axilas. Em seguida <b>cubra imediatamente</b>: manta térmica, sala aquecida, cristaloide e hemocomponentes aquecidos.',
   alerta:'O ATLS é explícito: prevenir a hipotermia é essencial, porque ela piora a coagulopatia e a acidose metabólica. Na maioria das vezes a hipotermia do trauma é iatrogênica.'}
 ]},

{id:'sri', cat:'via', nome:'Sequência rápida de intubação', sub:'os 7 P',
 fonte:'ATLS 10ª ed., p. 35; prática consolidada de SRI',
 intro:'Planeje em voz alta com a equipe antes de tocar no paciente. Diga quem faz o quê, qual o plano A e qual o plano de resgate.',
 etapas:[
  {t:'1. Preparo',
   d:'Confira o material com o mnemônico <b>SOAPME</b>: sucção testada ao alcance da mão; oxigênio; airway (tubo com balonete testado em dois tamanhos, bougie, laringoscópio, videolaringoscópio, máscara laríngea); posicionamento; monitorização com capnografia; fármacos preparados e rotulados.',
   d2:'Tenha um plano para via aérea cirúrgica <b>antes</b> de começar, e saiba onde está o equipamento de resgate. Preveja dificuldade com o <b>LEMON</b>.'},
  {t:'2. Pré-oxigenação',
   d:'Três minutos com máscara não reinalante a 15 L/min, ou oito respirações profundas se houver pressa. Mantenha <b>cateter nasal a 15 L/min durante toda a apneia</b>. Se a saturação não sobe acima de 93%, use ventilação não invasiva ou bolsa-válvula-máscara com PEEP e vedação a quatro mãos.',
   alerta:'Não pule esta etapa por causa da pressa. É ela que compra o tempo seguro para a laringoscopia.'},
  {t:'3. Otimização hemodinâmica',
   d:'<b>Ressuscite antes de intubar.</b> Corrija a hipotensão com sangue ou volume, corrija hipoxemia, acidose e hipocalcemia. Deixe o vasopressor pronto e conectado.',
   d2:'Índice de choque (FC dividida pela PAS) acima de 0,9 prevê colapso pós-intubação: reduza a dose do indutor e antecipe o vasopressor.',
   doses:[{n:'Noradrenalina', txt:'iniciar e titular', min:0.05, max:0.5, un:'mcg/kg/min', dil:DIL.nora}],
   alerta:'A parada cardíaca peri-intubação no trauma quase sempre é hipovolemia somada à dose cheia do indutor e à pressão positiva.'},
  {t:'4. Pré-tratamento',
   d:'Opcional. Considere fentanil para atenuar a resposta simpática à laringoscopia no TCE. Omita se o paciente estiver hipotenso.',
   doses:[{n:'Fentanil', txt:'1 a 3 min antes da indução', min:1, max:3, un:'mcg/kg', base:'ajustado'}]},
  {t:'5. Paralisia com indução',
   d:'Indutor e bloqueador em sequência rápida, um atrás do outro. O ATLS registra que o etomidato não afeta a pressão arterial nem a pressão intracraniana, mas reduz a função adrenal.',
   doses:[
     {n:'Cetamina', txt:'estável', min:1, max:2, un:'mg/kg'},
     {n:'Cetamina', txt:'em choque', min:0.5, max:1, un:'mg/kg'},
     {n:'Etomidato', txt:'ATLS', min:0.3, max:0.3, un:'mg/kg'},
     {n:'Rocurônio', txt:'dose de SRI', min:1.2, max:1.2, un:'mg/kg', base:'ideal'},
     {n:'Succinilcolina', txt:'ATLS: 1–2 mg/kg', min:1, max:2, un:'mg/kg'}
   ],
   alerta:'Succinilcolina é proibida com hipercalemia, esmagamento extenso, queimadura ou lesão medular há mais de 48 h, insuficiência renal crônica e doença neuromuscular. Na dúvida, rocurônio.'},
  {t:'6. Posicionamento e passagem',
   d:'Abra a parte anterior do colar e mantenha <b>estabilização manual em linha</b> feita por um assistente. Laringoscopia após 45 a 60 segundos. Use bougie na primeira tentativa se a visão for parcial.',
   alerta:'Máximo de três tentativas, e troque alguma coisa entre elas: operador, lâmina, posição ou dispositivo. Saturação abaixo de 90%, pare e ventile.'},
  {t:'7. Pós-intubação',
   d:'Confirme com <b>capnografia em onda</b>. O ATLS alerta que a presença de CO₂ confirma a via aérea mas não exclui intubação seletiva de brônquio — confirme com ausculta bilateral e radiografia. Insufle o balonete, fixe o tubo, anote a altura na arcada.',
   d2:'Ventilação protetora com 6 a 8 mL/kg de peso predito, PEEP inicial de 5, alvo de PaCO₂ em torno de 35 mmHg. Reinstale o colar cervical.',
   doses:[
     {n:'Fentanil', txt:'manutenção', min:0.5, max:3, un:'mcg/kg/h', base:'ajustado', dil:DIL.fenta},
     {n:'Midazolam', txt:'manutenção', min:0.02, max:0.1, un:'mg/kg/h', base:'ajustado', dil:DIL.mida}
   ],
   alerta:'Paciente paralisado e acordado é dano evitável. A sedação entra antes de o bloqueador passar.'}
 ]},

{id:'falha', cat:'via', nome:'Falha de via aérea', sub:'plano de resgate',
 fonte:'ATLS 10ª ed., cap. 2; algoritmos de via aérea difícil',
 intro:'Acione quando houver três tentativas sem sucesso, ou a qualquer momento em que não conseguir intubar nem oxigenar. Fale em voz alta: "via aérea falha, plano B".',
 etapas:[
  {t:'Plano A — otimizar a laringoscopia',
   d:'Bougie, manobra externa na laringe, reposicionar a cabeça, aspirar de novo, videolaringoscópio, trocar para o operador mais experiente. Uma mudança por tentativa.'},
  {t:'Plano B — dispositivo supraglótico',
   d:'Máscara laríngea de segunda geração no tamanho certo para o peso. Ventile, oxigene e reorganize. Pode servir de conduto para intubação ou de ponte até a via cirúrgica.'},
  {t:'Plano C — bolsa-válvula-máscara a quatro mãos',
   d:'Duas pessoas: uma faz a vedação com as duas mãos em C-E e tração de mandíbula, a outra ventila. Cânula orofaríngea e nasofaríngea juntas. O objetivo é oxigenar, não normalizar o CO₂.'},
  {t:'Plano D — cricotireoidostomia cirúrgica',
   d:'Não conseguiu intubar nem oxigenar: <b>decida cedo</b>. Palpe a membrana cricotireóidea, incisão vertical na pele, dissecção romba, incisão horizontal na membrana, gancho traqueal, bougie, tubo 6.0 e insuflar o balonete. Confirme com capnografia.',
   alerta:'Contraindicada abaixo de 12 anos: nessa faixa faça punção cricotireóidea com cateter 14G e oxigenação transtraqueal como medida temporária, com transporte imediato para via aérea definitiva.'}
 ]},

{id:'volume', cat:'hem', nome:'Reposição volêmica', sub:'ressuscitação de controle de danos',
 fonte:'ATLS 10ª ed., p. 52 a 56',
 intro:'O princípio mudou na 10ª edição: o bólus inicial caiu para 1 litro e o sangue entra cedo. Volume não substitui o controle cirúrgico do sangramento.',
 etapas:[
  {t:'1. Acesso e coleta',
   d:'Dois acessos periféricos <b>curtos e calibrosos, calibre mínimo 18G</b> — a vazão depende da quarta potência do raio e é inversamente proporcional ao comprimento, então cateter curto e grosso corre mais que cateter longo e fino. Sem sucesso, intraósseo.',
   d2:'Colha no momento da punção: tipagem e provas cruzadas, gasometria com lactato, hemograma, coagulograma, toxicológico e beta-HCG em toda mulher em idade fértil.'},
  {t:'2. Bólus inicial de cristaloide',
   d:'Solução isotônica <b>aquecida</b>, de preferência Ringer lactato. <b>Adulto: 1 litro. Criança abaixo de 40 kg: 20 mL/kg.</b> Este é o teto, não a meta.',
   doses:[{n:'Ringer lactato', txt:'bólus pediátrico', min:20, max:20, un:'mL/kg', teto:1000}],
   alerta:'O volume total deve ser baseado na resposta, e o que foi administrado no pré-hospitalar conta. A infusão contínua de grandes volumes para atingir pressão normal não substitui o controle definitivo da hemorragia.'},
  {t:'3. Classificar a resposta',
   d:'<b>Resposta rápida:</b> retorno ao normal, perda abaixo de 15%, transfusão pouco provável — mas a avaliação por um cirurgião ainda é indispensável. <b>Resposta transitória:</b> melhora e recidiva, perda de 15% a 40%, segue sangrando. <b>Resposta mínima ou ausente:</b> perda acima de 40%, exige intervenção definitiva imediata.',
   fonteEtapa:'Tabela 3-2, p. 53'},
  {t:'4. Passar a hemocomponentes',
   d:'Resposta transitória ou ausente: <b>ative o protocolo de transfusão maciça</b>. A administração precoce de hemácias, plasma e plaquetas em baixa proporção entre si previne coagulopatia e plaquetopenia. Sangue O negativo ou tipo-específico enquanto a prova cruzada não sai.'},
  {t:'5. Fármacos adjuvantes',
   d:'Ácido tranexâmico o mais cedo possível, dentro de 3 h. Cálcio apenas guiado pelo cálcio ionizado.',
   doses:[
     {n:'Ácido tranexâmico', txt:'ataque em 10 min', min:15, max:15, un:'mg/kg', teto:1000},
     {n:'Ácido tranexâmico', txt:'manutenção por 8 h', min:2, max:2, un:'mg/kg/h'},
     {n:'Gluconato de cálcio 10%', txt:'se cálcio ionizado baixo', min:0.2, max:0.5, un:'mL/kg', teto:30}
   ],
   alerta:'A maioria dos transfundidos não precisa de cálcio, e a suplementação excessiva é nociva. Não reponha por contagem de bolsas.'},
  {t:'6. Alvos e reavaliação',
   d:'<b>Hipotensão permissiva</b> até o controle da hemorragia. Débito urinário é o melhor indicador isolado: <b>0,5 mL/kg/h no adulto, 1 mL/kg/h na criança e 2 mL/kg/h abaixo de 1 ano</b>. Acompanhe lactato e déficit de bases.',
   alerta:'Se a pressão subir rápido antes do controle da hemorragia, pode haver ressangramento. A hipotensão permissiva não vale para TCE nem para lesão medular.'}
 ]},

{id:'chem', cat:'hem', nome:'Choque hemorrágico', sub:'classes segundo a 10ª edição',
 fonte:'ATLS 10ª ed., Tabela 3-1, p. 49',
 intro:'Atenção: a 10ª edição abandonou os valores numéricos de frequência e pressão por classe. A tabela agora usa tendências e acrescenta o déficit de bases, que detecta o choque antes dos sinais vitais.',
 etapas:[
  {t:'Classe I — perda abaixo de 15%',
   d:'Todos os parâmetros clínicos inalterados. Déficit de bases de <b>0 a −2 mEq/L</b>. Equivale ao doador de uma unidade de sangue. <b>Conduta:</b> monitorar; não exige reposição.'},
  {t:'Classe II (leve) — 15% a 30%',
   d:'Frequência cardíaca normal ou aumentada, pressão arterial mantida, <b>pressão de pulso reduzida</b>, frequência respiratória e diurese ainda normais. Déficit de bases de <b>−2 a −6 mEq/L</b>. <b>Conduta:</b> cristaloide; hemocomponentes possíveis.',
   alerta:'A pressão sistólica normal engana. A queda da pressão de pulso é o sinal precoce — pressão baixa no jovem já é perda avançada.'},
  {t:'Classe III (moderada) — 31% a 40%',
   d:'Taquicardia, pressão arterial normal ou reduzida, pressão de pulso reduzida, frequência respiratória normal ou aumentada, <b>diurese e Glasgow em queda</b>. Déficit de bases de <b>−6 a −10 mEq/L</b>. <b>Conduta:</b> hemocomponentes indicados.'},
  {t:'Classe IV (grave) — acima de 40%',
   d:'Taquicardia acentuada, hipotensão, pressão de pulso estreita, taquipneia, <b>diurese muito reduzida</b>, Glasgow rebaixado. Déficit de bases de <b>−10 mEq/L ou pior</b>. Evento pré-terminal: sem medidas agressivas, óbito em minutos. <b>Conduta:</b> protocolo de transfusão maciça.'},
  {t:'Corrigir a tríade letal',
   d:'Trate os três juntos: <b>hipotermia</b> (ambiente aquecido, mantas, fluidos aquecidos), <b>acidose</b> (perfusão e controle da hemorragia — o ATLS é explícito que bicarbonato não trata a acidose do choque) e <b>coagulopatia</b> (plasma, plaquetas, fibrinogênio, ácido tranexâmico, cálcio guiado).'},
  {t:'Armadilhas na avaliação',
   d:'Idoso em uso de betabloqueador não taquicardiza e tem redução relativa da atividade simpática. O jovem mantém a pressão até o colapso. Atleta tem bradicardia basal. Portador de marca-passo não varia a frequência. O volume sanguíneo da criança é de <b>8% a 9% do peso</b>, cerca de 80 a 90 mL/kg.',
   alerta:'No obeso, o volume sanguíneo deve ser calculado pelo peso ideal: usar o peso real superestima significativamente a volemia.'}
 ]},

{id:'cobs', cat:'circ', nome:'Choque obstrutivo', sub:'pneumotórax hipertensivo e tamponamento',
 fonte:'ATLS 10ª ed., cap. 4',
 intro:'Reversível em minutos com procedimento à beira do leito. Suspeite sempre que o choque não responder a volume.',
 etapas:[
  {t:'Reconhecer o pneumotórax hipertensivo',
   d:'Diagnóstico <b>clínico</b>: desconforto respiratório, hipotensão, ausência de murmúrio de um lado, hipertimpanismo, turgência jugular, desvio de traqueia (sinal tardio e nem sempre presente). Na ultrassonografia, ausência de deslizamento pleural.',
   alerta:'Não espere a radiografia. Esperar exame de imagem para tratar pneumotórax hipertensivo é erro clássico e fatal.'},
  {t:'Descomprimir',
   d:'Cateter sobre agulha de pelo menos 8 cm no <b>5º espaço intercostal, na linha axilar anterior</b>, logo acima da borda superior da costela inferior. A alternativa é o 2º espaço na linha hemiclavicular, com falha mais frequente no adulto por causa da espessura da parede.'},
  {t:'Drenar',
   d:'A punção é medida temporária. Siga com <b>drenagem torácica em selo d\'água</b> no 5º espaço intercostal, na linha axilar média, sob anestesia local e técnica estéril.'},
  {t:'Reconhecer o tamponamento cardíaco',
   d:'Trauma penetrante na zona precordial. <b>Tríade de Beck:</b> hipotensão, turgência jugular e bulhas abafadas — completa em poucos casos. FAST com líquido pericárdico confirma.',
   alerta:'A turgência jugular pode estar ausente se o paciente também estiver hipovolêmico. Ausência de jugular estufada não afasta tamponamento.'},
  {t:'Tratar o tamponamento',
   d:'Volume para melhorar transitoriamente a pré-carga enquanto prepara o definitivo. <b>Pericardiocentese guiada por ultrassom</b> como ponte, mas o tratamento é cirúrgico: janela pericárdica ou toracotomia. Toracotomia de reanimação na parada presenciada com trauma penetrante torácico e sinais de vida recentes.'}
 ]},

{id:'cneu', cat:'neuro', nome:'Choque neurogênico', sub:'lesão medular',
 fonte:'ATLS 10ª ed., cap. 3 e 7',
 intro:'Diagnóstico de exclusão. Só é neurogênico depois de descartar hemorragia — os dois coexistem com frequência.',
 etapas:[
  {t:'Reconhecer o padrão',
   d:'Lesão medular acima de T6 com perda do tônus simpático: <b>hipotensão com bradicardia</b>, pele quente, seca e corada, extremidades bem perfundidas, sem taquicardia compensatória. Contrasta com o choque hemorrágico, de pele fria, pálida e úmida com taquicardia.',
   alerta:'Choque medular é outra coisa: significa a perda transitória de reflexos e tônus abaixo da lesão, não o quadro hemodinâmico. Não confunda os termos.'},
  {t:'Descartar hemorragia primeiro',
   d:'FAST, radiografia de tórax e pelve, exame do abdome. Um politraumatizado com lesão medular pode estar sangrando e não sentir dor abdominal por causa do nível sensitivo.'},
  {t:'Volume com moderação',
   d:'Reponha até a euvolemia, sem excesso. O problema é <b>vasoplegia, não perda de volume</b> — insistir em cristaloide gera edema pulmonar e piora a perfusão medular.'},
  {t:'Vasopressor e cronotrópico',
   d:'Noradrenalina pelo efeito alfa e beta combinado. Atropina para bradicardia sintomática; em casos refratários, marca-passo transcutâneo.',
   doses:[
     {n:'Noradrenalina', txt:'titular pela pressão média', min:0.05, max:1, un:'mcg/kg/min', dil:DIL.nora},
     {n:'Atropina', txt:'bradicardia sintomática', min:0.02, max:0.02, un:'mg/kg', piso:0.1, teto:1}
   ]},
  {t:'Alvo de perfusão medular',
   d:'Manter <b>pressão arterial média entre 85 e 90 mmHg nos primeiros 7 dias</b> para preservar a perfusão da medula lesada. Evite hipóxia e hipotermia. Discussão precoce com a neurocirurgia.',
   alerta:'Esta meta vem de estudos de baixa qualidade e não é consenso. Confira o protocolo do seu serviço.'}
 ]},

{id:'tce', cat:'neuro', nome:'TCE grave', sub:'prevenção da lesão secundária',
 fonte:'ATLS 10ª ed., cap. 6',
 intro:'A lesão primária já aconteceu. Todo o cuidado é para evitar a lesão secundária — e os dois maiores vilões são hipotensão e hipóxia.',
 etapas:[
  {t:'Alvos fisiológicos',
   d:'Evitar <b>PAS abaixo de 90 mmHg</b>; a meta usual é 110 mmHg ou mais. Saturação acima de 94%. <b>PaCO₂ em torno de 35 mmHg</b>, o limite inferior da normalidade. Normoglicemia e normotermia.',
   alerta:'Um único episódio de hipotensão ou de hipóxia piora acentuadamente o desfecho no TCE grave.'},
  {t:'Medidas gerais',
   d:'Cabeceira a 30°, cabeça em posição neutra, <b>colar cervical frouxo</b> para não obstruir o retorno venoso jugular. Sedação e analgesia adequadas, prevenção de tosse e esforço.'},
  {t:'Ácido tranexâmico',
   d:'Dentro de 3 h do trauma, em pacientes com Glasgow de 9 a 15 e sangramento intracraniano na tomografia (CRASH-3).',
   doses:[
     {n:'Ácido tranexâmico', txt:'ataque em 10 min', min:15, max:15, un:'mg/kg', teto:1000},
     {n:'Ácido tranexâmico', txt:'manutenção por 8 h', min:2, max:2, un:'mg/kg/h'}
   ]},
  {t:'Sinais de herniação',
   d:'<b>Pupila dilatada</b>, hemiparesia, perda da consciência, queda de 2 ou mais pontos no Glasgow, tríade de Cushing. O ATLS considera esse quadro indicação forte de osmoterapia no paciente normovolêmico.'},
  {t:'Osmoterapia',
   d:'Manitol em <b>bólus rápido de 1 g/kg em cerca de 5 min</b> na herniação, e 0,25 a 1 g/kg para controle da PIC — sempre em bólus, nunca em gotejamento contínuo, mantendo osmolaridade abaixo de 320 mOsm. A salina hipertônica pode ser preferida no hipotenso porque não age como diurético.',
   doses:[
     {n:'Manitol 20%', txt:'herniação', min:1, max:1, un:'g/kg'},
     {n:'Manitol 20%', txt:'controle da PIC', min:0.25, max:1, un:'g/kg'},
     {n:'Salina hipertônica 3%', txt:'em 15 a 20 min', min:3, max:5, un:'mL/kg'}
   ],
   alerta:'Nenhuma das duas reduz a PIC adequadamente no hipovolêmico. Manitol no hipotenso agrava a hipotensão.'},
  {t:'Hiperventilação',
   d:'Normocapnia é o padrão. <b>Evite hiperventilar nas primeiras 24 h</b>, salvo sinais de herniação. Períodos curtos com <b>PaCO₂ de 25 a 30 mmHg</b> podem ser usados para tratar deterioração neurológica aguda enquanto outras medidas são instituídas.',
   alerta:'Hiperventilação profilática com PaCO₂ abaixo de 25 mmHg não é recomendada: causa vasoconstrição e isquemia no cérebro já lesionado.'},
  {t:'Profilaxia de convulsão',
   d:'Por 7 dias no TCE grave, para reduzir crises precoces. Não altera a incidência de epilepsia tardia.',
   doses:[
     {n:'Fenitoína', txt:'ataque, máximo 50 mg/min', min:15, max:20, un:'mg/kg'},
     {n:'Levetiracetam', txt:'ataque em 15 min', min:20, max:20, un:'mg/kg', teto:3000}
   ]},
  {t:'Imagem e destino',
   d:'Tomografia de crânio sem contraste assim que a via aérea e a hemodinâmica permitirem. Reavaliação neurológica seriada. Defina cedo com a neurocirurgia a indicação de monitorização de PIC ou de craniectomia.'}
 ]},

/* ---------- CLÍNICA: DOR TORÁCICA ---------- */
{id:'dortor', cat:'sca', nome:'Dor torácica na emergência', sub:'estratificação',
 fonte:'Diretriz Brasileira de Atendimento à Dor Torácica na Unidade de Emergência, SBC 2025 (Arq Bras Cardiol 2025;122(9):e20250620)',
 intro:'A diretriz de 2025 abandona os termos "dor típica" e "atípica", que geram falha de comunicação, e orienta classificar a suspeita como alta, moderada ou baixa.',
 etapas:[
  {t:'1. ECG em até 10 minutos',
   d:'Todo paciente com dor torácica faz ECG de 12 derivações <b>nos primeiros 10 minutos</b> da chegada. Repita seriadamente se a suspeita persistir e o primeiro traçado for normal.'},
  {t:'2. Procurar oclusão coronariana, não só supra de ST',
   d:'Além do supradesnivelamento clássico, reconheça os padrões de oclusão com ECG sem supra: <b>padrão de De Winter</b> (infra no ponto J de pelo menos 1 mm em V1 a V6 seguido de onda T apiculada e simétrica), <b>critérios de Sgarbossa modificados por Smith</b> no bloqueio de ramo esquerdo ou ritmo de marca-passo, ondas T hiperagudas e <b>supra em aVR com infra difuso</b>.',
   fonteEtapa:'De Alencar et al., Arq Bras Cardiol 2024;121(5):e20230733'},
  {t:'3. Escore HEART',
   d:'Cinco domínios, de 0 a 2 pontos cada: <b>H</b>istória (muito, moderadamente ou pouco suspeita), <b>E</b>CG (depressão significativa de ST = 2; alteração inespecífica de repolarização = 1; normal = 0), <b>A</b>nos (65 ou mais = 2; 45 a 64 = 1; abaixo de 45 = 0), fatores de <b>R</b>isco (3 ou mais ou doença aterosclerótica = 2; 1 a 2 = 1; nenhum = 0) e <b>T</b>roponina (acima de 3 vezes o limite = 2; 1 a 3 vezes = 1; normal = 0).',
   d2:'Fatores de risco considerados: hipertensão, hipercolesterolemia, diabetes, obesidade com IMC acima de 30 e tabagismo atual ou cessado há 3 meses ou menos.'},
  {t:'4. Interpretar o HEART',
   d:'<b>0 a 3 pontos:</b> risco baixo de evento cardiovascular maior em 6 semanas. <b>4 a 6 pontos:</b> risco médio. <b>7 a 10 pontos:</b> risco elevado.',
   alerta:'O escore foi derivado com troponina convencional e prevê eventos em 6 semanas, não faz diagnóstico de SCA. Ele complementa a troponina, não a substitui.'},
  {t:'5. Troponina seriada',
   d:'Com troponina ultrassensível, use algoritmos <b>0/1 h ou 0/2 h</b> com os pontos de corte do kit do laboratório. Com troponina convencional, dosagens seriadas a cada 3 h. Valores diferem por sexo e idade.',
   d2:'Injúria miocárdica crônica: variação de 20% ou menos entre as dosagens, com pelo menos um valor acima do percentil 99. Injúria aguda implica variação maior.'},
  {t:'6. Não esquecer as outras causas letais',
   d:'Dissecção de aorta, tromboembolismo pulmonar, pneumotórax hipertensivo, tamponamento e ruptura de esôfago. A dissecção tem mortalidade de 1% a 2% por hora nas primeiras 48 h.'}
 ]},

{id:'iamcsst', cat:'sca', nome:'IAM com supra de ST', sub:'reperfusão',
 fonte:'Mapa de estudo GT-01 — validar com a diretriz da SBC antes de uso clínico',
 intro:'O relógio começa no primeiro contato médico. A decisão é uma só: angioplastia primária ou trombólise.',
 etapas:[
  {t:'1. Medidas imediatas',
   d:'Monitorização, acesso venoso, oxigênio apenas se saturação abaixo de 90%. AAS mastigado para todos.',
   doses:[{n:'AAS', txt:'mastigar'},{n:'Atorvastatina', txt:'nas primeiras 24 h'}]},
  {t:'2. Escolher a estratégia de reperfusão',
   d:'<b>Angioplastia primária</b> se houver hemodinâmica disponível em até 120 min do primeiro contato. <b>Trombólise</b> se o tempo for maior, dentro de 12 h do início dos sintomas, seguida de transferência para centro com hemodinâmica.'},
  {t:'3. Antiagregação conforme a estratégia',
   d:'Com <b>angioplastia</b>: clopidogrel 600 mg, ou ticagrelor 180 mg, ou prasugrel 60 mg após conhecer a anatomia. Com <b>trombólise</b>: apenas clopidogrel; sem dose de ataque acima de 75 anos.',
   alerta:'Ticagrelor e prasugrel são contraindicados junto com trombolítico.'},
  {t:'4. Anticoagulação',
   d:'Sempre associada. Enoxaparina é preferível quando se usa trombolítico, mantida por 48 h a 8 dias. Heparina não fracionada quando houver disfunção renal grave ou cateterismo imediato.',
   doses:[
     {n:'Enoxaparina', txt:'abaixo de 75 anos', min:1, max:1, un:'mg/kg'},
     {n:'Heparina não fracionada', txt:'bólus, máx. 4000 UI', min:60, max:60, un:'U/kg', teto:4000}
   ]},
  {t:'5. Trombólise, se indicada',
   d:'Tenecteplase em bólus único ajustado ao peso, com metade da dose se o paciente tiver 75 anos ou mais.',
   formula:'tnk',
   alerta:'Rastreie contraindicações absolutas: AVC hemorrágico prévio, AVC isquêmico nos últimos 6 meses, lesão do sistema nervoso central, sangramento ativo, dissecção de aorta e trauma craniano recente.'},
  {t:'6. Critérios de reperfusão',
   d:'Avalie 60 a 90 min após o trombolítico: redução do supra em mais de 50%, alívio da dor e arritmia de reperfusão. Sem esses critérios, <b>angioplastia de resgate</b>.'},
  {t:'7. Complicações mecânicas',
   d:'Suspeite de ruptura de parede livre, comunicação interventricular e insuficiência mitral aguda por ruptura de músculo papilar diante de deterioração súbita, novo sopro ou choque cardiogênico. Em geral entre 2 e 7 dias, ou mais cedo com o infarto já reperfundido.'},
  {t:'8. Infarto de ventrículo direito',
   d:'Suspeite no infarto inferior: hipotensão, turgência jugular e pulmões limpos. Confirme com V3R e V4R. <b>Depende de pré-carga</b>: trate com volume.',
   alerta:'Nitrato, morfina e diurético podem causar colapso hemodinâmico no infarto de ventrículo direito. Evite.'}
 ]},

/* ---------- CLÍNICA: ASMA ---------- */
{id:'asma', cat:'resp', nome:'Exacerbação asmática', sub:'tratamento na emergência',
 fonte:'Guia do Episódio de Cuidado — Exacerbação Asmática em Adultos, rev. 25/07/2024',
 intro:'Classifique a gravidade antes de tratar e identifique quem tem risco de morte por asma: intubação prévia, internação no último ano, uso excessivo de broncodilatador de curta duração, ausência de corticoide inalatório e alergia alimentar confirmada.',
 etapas:[
  {t:'1. Classificar a gravidade',
   d:'<b>Leve a moderada:</b> fala frases, prefere sentar, sem agitação, sem musculatura acessória, FC de 100 a 120, saturação acima de 90%, pico de fluxo acima de 50% do previsto.',
   d2:'<b>Grave:</b> fala frases interrompidas ou palavras, senta inclinado para a frente, agitado, FR acima de 30, usa musculatura acessória, FC acima de 120, saturação abaixo de 90%, pico de fluxo abaixo de 50%. <b>Risco de vida:</b> exaustão, sonolência ou confusão, tórax silencioso, FC acima de 140 ou bradicardia.'},
  {t:'2. Broncodilatador em todos',
   d:'Beta-2 de curta duração precoce e repetido, com espaçador ou nebulização. Adicione ipratrópio nas exacerbações graves.',
   doses:[
     {n:'Salbutamol spray', txt:'4–8 jatos a cada 20 min, 3 doses'},
     {n:'Salbutamol nebulização', txt:'2,5–5 mg a cada 20 min, 3 doses'},
     {n:'Ipratrópio', txt:'0,5 mg a cada 20 min, 3 doses'}
   ]},
  {t:'3. Corticoide sistêmico',
   d:'Inicie se não houver melhora rápida com o broncodilatador, ou de imediato se o paciente já usava corticoide. Oral e venoso têm eficácia equivalente quando a via oral está disponível.',
   doses:[
     {n:'Prednisolona', txt:'VO, máximo 60 mg', min:1, max:1, un:'mg/kg', teto:60},
     {n:'Metilprednisolona', txt:'IV, 40 a 80 mg'},
     {n:'Hidrocortisona', txt:'IV, a cada 4 h', min:2, max:3, un:'mg/kg'}
   ]},
  {t:'4. Oxigenioterapia',
   d:'Titule para saturação de <b>93% a 95%</b>. Não use oxigênio em alto fluxo indiscriminadamente.'},
  {t:'5. Sulfato de magnésio na grave',
   d:'Considere na exacerbação grave ou com risco de vida que não respondeu à primeira hora.',
   doses:[{n:'Sulfato de magnésio', txt:'2 g diluídos em 50 mL de SF, em mais de 20 min'}]},
  {t:'6. Reavaliar em 1 hora',
   d:'<b>Boa resposta</b> sustentada por 1 h, exame normal e pico de fluxo acima de 90%: alta. <b>Resposta incompleta</b> com pico de fluxo de 40% a 69%: decidir pela internação conforme fatores de risco e condições domiciliares. <b>Sem resposta</b>, sintomas graves, PCO₂ de 42 mmHg ou mais, confusão: internar.',
   alerta:'PCO₂ normal ou elevado em paciente com asma grave e taquipneico indica fadiga muscular e falência iminente, não melhora.'},
  {t:'7. Critérios de terapia intensiva',
   d:'Parada cardiorrespiratória, necessidade de ventilação invasiva ou não invasiva, hipercapnia, acidose com pH abaixo de 7,30, hipoxemia, lactato elevado, hipotensão ou arritmia, pico de fluxo abaixo de 30%, ou uso de beta-2 venoso.'},
  {t:'8. Alta bem feita',
   d:'Corticoide sistêmico por 3 a 10 dias, corticoide inalatório iniciado ou com dose aumentada, <b>checar a técnica inalatória</b>, plano de ação por escrito e retorno em 2 a 7 dias.'}
 ]},

/* ---------- CLÍNICA: PAC ---------- */
{id:'pac', cat:'pac', nome:'Pneumonia adquirida na comunidade', sub:'manejo na emergência',
 fonte:'Guia Einstein — Manejo da PAC em Adultos, v4 (rev. 2025)',
 intro:'O diagnóstico é clínico, confirmado por imagem. Em 7% dos pacientes o achado radiológico só aparece depois de 48 h.',
 etapas:[
  {t:'1. Confirmar o diagnóstico',
   d:'Tosse, dispneia, dor pleurítica, febre e calafrios, com taquipneia, dessaturação ou crepitações ao exame. Radiografia em PA e perfil sempre que disponível: <b>novo infiltrado com quadro compatível confirma</b>. Ultrassonografia point-of-care mostra broncograma aéreo, linhas B focais e consolidação subpleural.'},
  {t:'2. Procurar sinais de alarme',
   d:'Confusão mental, FR de 22 ou mais, PAS abaixo de 90 ou PAD de 60 ou menos, saturação de 92% ou menos, uso de musculatura acessória, sinais de hipoperfusão, febre de 39 °C ou mais ou hipotermia, FC acima de 125, derrame pleural acima de 5 cm no perfil, derrame loculado, infiltrado multilobar, comorbidade descompensada e falha após 48 a 72 h de antibiótico.',
   alerta:'Qualquer sinal de alarme indica investigação laboratorial e encaminhamento para serviço de urgência, mesmo com escore de gravidade baixo.'},
  {t:'3. Estratificar com CURB-65 modificado',
   d:'Confusão, ureia, frequência respiratória, pressão arterial e idade de 65 anos ou mais. Sem exames laboratoriais disponíveis, use o CRB-65 modificado. <b>Escore de 3 ou mais indica terapia intensiva.</b>',
   d2:'Pacientes com escore 1 que apresentem disfunção orgânica — confusão, ureia acima de 45 mg/dL, FR de 22 ou mais, ou hipotensão — devem ser internados.'},
  {t:'4. Critérios de PAC grave',
   d:'<b>Um critério maior</b> (choque séptico com vasopressor, ou insuficiência respiratória com ventilação mecânica) <b>ou três ou mais menores</b>: FR acima de 30, PaO₂/FiO₂ abaixo de 250, infiltrados multilobares, confusão, ureia acima de 45 mg/dL, leucócitos abaixo de 4.000, plaquetas abaixo de 100.000, temperatura central abaixo de 36 °C, hipotensão exigindo reposição agressiva.'},
  {t:'5. Antibiótico ambulatorial',
   d:'<b>Sem comorbidade:</b> amoxicilina 500 mg 8/8h, ou amoxicilina com clavulanato 875/125 mg 12/12h, ou cefuroxima 500 mg 12/12h, ou doxiciclina 100 mg 12/12h, por 4 a 7 dias.',
   d2:'<b>Com comorbidade ou antibiótico nos últimos 3 meses:</b> betalactâmico por 7 dias <b>mais</b> claritromicina 500 mg 12/12h por 7 dias ou azitromicina 500 mg/dia por 5 dias. <b>Alergia a betalactâmico:</b> levofloxacino 500 a 750 mg/dia ou moxifloxacino 400 mg/dia.'},
  {t:'6. Antibiótico no internado',
   d:'<b>Sem risco de resistência:</b> ceftriaxona 1 g IV 12/12h mais macrolídeo, ou levofloxacino 750 mg, ou moxifloxacino 400 mg.',
   d2:'<b>Com risco para Pseudomonas</b> (DPOC com fator de risco, bronquiectasia, uso frequente de antibiótico ou corticoide): piperacilina com tazobactam 4,5 g 6/6h ou cefepime 2 g 8/8h, mais macrolídeo.'},
  {t:'7. Corticoide na PAC grave',
   d:'Indicado no imunocompetente com insuficiência respiratória que precisa de ventilação invasiva ou não invasiva, ou com PaO₂/FiO₂ abaixo de 300 e FiO₂ de 50% ou mais.',
   doses:[{n:'Hidrocortisona', txt:'200 mg/dia por 4 a 7 dias'}]},
  {t:'8. Troca para via oral e alta',
   d:'Troque quando houver ingestão oral preservada, temperatura de 37,8 °C ou menos, FR de 24 ou menos e PAS de 90 mmHg ou mais sem vasopressor por pelo menos 8 h, sem descompensação de comorbidade. Alta com estado mental basal e saturação de 90% ou mais em ar ambiente.',
   d2:'Considere procalcitonina no quinto dia: normal e com boa evolução, avalie suspender o antibiótico. <b>Não é preciso observar o paciente por uma noite após a troca para via oral.</b>'}
 ]}
];
