import json,importlib.util,glob
P='../../dynasties.json';d=json.load(open(P));civ={x['slug']:x for x in json.load(open('../../civilizations.json'))}
M={'maurya-dynasty':'maurya-empire','satavahana-dynasty':'satavahana-dynasty','gupta-dynasty':'gupta-empire','pala-dynasty':'pala-empire','rashtrakuta-dynasty':'rashtrakuta-dynasty','chola-dynasty-imperial':'chola-empire','sangama-saluva-and-tuluva-dynasties-vijayanagara':'vijayanagara-empire','mughal-dynasty':'mughal-empire','ahom-dynasty':'ahom-kingdom','maratha-empire-bhonsle-and-peshwas':'maratha-confederacy','sikh-empire-sukerchakia':'sikh-empire','mysore-wodeyar-and-hyder-ali':'kingdom-of-mysore','achaemenid-dynasty':'achaemenid-persian-empire','ottoman-dynasty':'ottoman-empire','safavid-dynasty':'safavid-iran','kushan-dynasty':'kushan-empire','xia-dynasty-traditional':'xia-and-shang-china','shang-dynasty':'xia-and-shang-china','zhou-dynasty':'zhou-dynasty','qin-dynasty':'qin-dynasty','han-dynasty':'han-dynasty','tang-dynasty':'tang-dynasty','song-dynasty':'song-dynasty','yuan-dynasty':'yuan-dynasty','ming-dynasty':'ming-dynasty','qing-dynasty':'qing-dynasty','tokugawa-shogunate':'edo-japan-tokugawa','joseon-dynasty':'joseon-korea','khmer-empire-angkor':'khmer-empire','srivijaya':'srivijaya','majapahit':'majapahit','keita-dynasty-mali':'mali-empire','aztec-rulers-tlatoani':'aztec-empire','inca-sapa-inca-line':'inca-empire','maya-dynasties-of-tikal':'maya-civilisation'}
new={}
for f in sorted(glob.glob('d*.py')):
    s=importlib.util.spec_from_file_location('m',f);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);new.update(m.D)
for x in d:
    r,fl=new.get(x['slug'],(None,None))
    if x['slug'] in M: c=civ[M[x['slug']]]; r,fl=r or c['rise'],fl or c['fall']
    if r and len(r)>len(x['rise']): x['rise']=r
    if fl and len(fl)>len(x['fall']): x['fall']=fl
json.dump(d,open(P,'w'),ensure_ascii=False,indent=0)
print(sorted((len(x['rise'])+len(x['fall']),x['slug']) for x in d)[:45])
