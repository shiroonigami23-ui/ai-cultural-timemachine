import json,re
P=[
("New fossils from Jebel Irhoud, Morocco and the pan-African origin of Homo sapiens","J.-J. Hublin et al.",2017,"Nature","10.1038/nature22336","Human origins","Subscription","©",False,None,"Fossils ~300,000 years old pushed back the origin of our species by about 100,000 years."),
("A draft sequence of the Neandertal genome","R. E. Green et al.",2010,"Science","10.1126/science.1188021","Human origins","Free to read","©",False,None,"Showed that non-Africans carry a little Neanderthal DNA from interbreeding."),
("Human occupation of northern Australia by 65,000 years ago","C. Clarkson et al.",2017,"Nature","10.1038/nature22968","Human migration","Subscription","©",False,None,"Madjedbebe rock shelter pushed the arrival of people in Australia back to ~65,000 years."),
("Early Pleistocene presence of Acheulian hominins in South India","S. Pappu et al.",2011,"Science","10.1126/science.1200183","Prehistoric India","Subscription","©",False,None,"Hand-axes at Attirampakkam near Chennai date to ~1.5 million years ago."),
("Middle Paleolithic assemblages from the Indian subcontinent before and after the Toba super-eruption","M. Petraglia et al.",2007,"Science","10.1126/science.1141564","Prehistoric India","Subscription","©",False,None,"Stone tools at Jwalapuram suggest people in India survived the Toba eruption."),
("The formation of human populations in South and Central Asia","V. M. Narasimhan et al.",2019,"Science","10.1126/science.aat7487","Ancient DNA","Free to read","©",False,None,"Ancient DNA from 524 people traced how South Asians descend from ancient hunter-gatherers, Iranian-related farmers and steppe pastoralists."),
("An ancient Harappan genome lacks ancestry from steppe pastoralists or Iranian farmers","V. Shinde et al.",2019,"Cell","10.1016/j.cell.2019.08.048","Indus civilisation","Open access","CC BY 4.0",True,"https://www.cell.com/action/showPdf?pii=S0092-8674(19)30967-5","The first genome from a Rakhigarhi Indus-era individual."),
("Fluvial landscapes of the Harappan civilization","L. Giosan et al.",2012,"PNAS","10.1073/pnas.1112743109","Indus civilisation","Open access","PNAS open access",True,"https://www.pnas.org/doi/pdf/10.1073/pnas.1112743109","A weakening monsoon reshaped Indus rivers, contributing to the shift from cities to villages."),
("Oxygen isotope in archaeological bioapatites from India: implications to climate change and decline of Bronze Age Harappan civilization","A. Sarkar et al.",2016,"Scientific Reports","10.1038/srep26555","Indus civilisation","Open access","CC BY 4.0",True,"https://www.nature.com/articles/srep26555.pdf","Evidence that monsoon weakening began earlier than thought, with Harappans adapting crops."),
("What drives societal collapse?","H. Weiss, R. S. Bradley",2001,"Science","10.1126/science.291.5504.609","Climate and collapse","Subscription","©",False,None,"Argued abrupt climate change, including the 4.2-kiloyear event, toppled early civilisations."),
("Massive migration from the steppe was a source for Indo-European languages in Europe","W. Haak et al.",2015,"Nature","10.1038/nature14317","Ancient DNA","Free to read","©",False,None,"Yamnaya herders spread into Europe ~4,500 years ago."),
("Development and disintegration of Maya political systems in response to climate change","D. J. Kennett et al.",2012,"Science","10.1126/science.1226299","Climate and collapse","Subscription","©",False,None,"A cave record from Belize links Maya expansion and collapse to rainfall."),
("Cooling and societal change during the Late Antique Little Ice Age from 536 to around 660 AD","U. Büntgen et al.",2016,"Nature Geoscience","10.1038/ngeo2652","Climate and collapse","Subscription","©",False,None,"Tree rings show a volcanic cold spell coinciding with plague and upheaval."),
("A draft genome of Yersinia pestis from victims of the Black Death","K. I. Bos et al.",2011,"Nature","10.1038/nature10549","Pandemics","Free to read","©",False,None,"Ancient DNA confirmed Y. pestis caused the Black Death."),
]
out=[]
for n,a,y,j,doi,t,acc,lic,mir,pdf,s in P:
    last=a.split(' et al')[0].split(',')[0].split()[-1]
    slug=re.sub(r'[^a-z0-9]+','-',f"{last} {y} {' '.join(n.split()[:3])}".lower()).strip('-')
    out.append(dict(name=n,authors=a,year=y,journal=j,doi=doi,topic=t,access=acc,license=lic,mirror=mir,pdf_url=pdf,analysis=None,summary=s,slug=slug,url="https://doi.org/"+doi,emoji="📄",group=t))
json.dump(out,open('../papers.json','w'),ensure_ascii=False,indent=1);print(len(out))
