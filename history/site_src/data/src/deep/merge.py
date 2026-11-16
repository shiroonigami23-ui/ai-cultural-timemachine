import json,importlib.util,glob
P='../../civilizations.json';d=json.load(open(P));by={x['slug']:x for x in d}
for f in sorted(glob.glob('c*.py')):
    s=importlib.util.spec_from_file_location('m',f);m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
    for slug,fields in m.D.items():
        for k,v in fields.items():
            if len(v)>len(str(by[slug].get(k,''))): by[slug][k]=v
json.dump(d,open(P,'w'),ensure_ascii=False,indent=0)
import statistics
for k in ['government','architecture','technology','rise','fall','legacy','life','culture','food']:
    print(k,statistics.median(len(str(x.get(k,''))) for x in d))
