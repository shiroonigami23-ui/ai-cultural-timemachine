import json,importlib.util,glob
P='../../events.json';d=json.load(open(P));by={x['name']:x for x in d};D={}
for f in sorted(glob.glob('ev/e*.py')):
    s=importlib.util.spec_from_file_location('m',f);m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
    for k,v in m.D.items():
        if k not in by: print('MISSING',k);continue
        if len(v)>len(D.get(k,'')): D[k]=v
for k,v in D.items():
    if len(v)>len(by[k]['summary']): by[k]['details']=v
json.dump(d,open(P,'w'),ensure_ascii=False,indent=0)
print(len(D),'thin left:',[x['name'] for x in d if len(x.get('details',x['summary']))<250])
