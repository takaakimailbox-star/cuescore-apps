import json,collections
b='outputs/d-plan2-prototype/'
rows=[]
for f in['proto-ja-en.json','proto-zh.json','proto-long.json']:rows+=json.load(open(b+f))['rows']
print('rows',len(rows))
def line(r,k):
    m=r[k];p1,p2=m['p1'],m['p2']
    return f"head{m['headGap']:>3} card{p1['w']}x{p1['h']} av{p1['av']} nameF{p1['nameFont']:.0f}/{p2['nameFont']:.0f} lines{p1['nameLines']}/{p2['nameLines']} avN{p1['avName']}/{p2['avName']} nR{p1['nameRace']}/{p2['nameRace']} raceF{p1['raceFont']:.0f} clockH{m['clockH']} blank{m['bottomEmpty']} tab{m['startToTab']} scr{m['scrollNeeded']}"
# normal rows, ja
print('--- ja (normal names)')
for r in rows:
    if r['tag'].startswith('ja/') and not r['long'] and r['state'].startswith(('A','C')):
        print(r['tag'],r['state'][:1]);print('  B',line(r,'before'));print('  A',line(r,'after'))
# checks over all rows
c=collections.Counter();bad=collections.defaultdict(list)
for r in rows:
    a=r['after'];be=r['before'];t=(r['tag'],r['state'][:1],'long' if r['long'] else '')
    c['n']+=1
    ok=lambda k,v:(c.update([k+('_ok' if v else '_ng')]),(None if v else bad[k].append(t)))
    ok('aligned',a['cardsAligned'])
    ok('no_hscroll',not a['hscroll'])
    ok('targets44',not a['small'])
    ok('note_hidden',not a['noteShown'])
    w=int(r['tag'].split('/')[1])
    if w>=390:ok('start_tab_kept',abs(a['startToTab']-be['startToTab'])<=1)
    ok('avatar68',a['p1']['av']==68)
    ok('name>race',a['p1']['nameFont']>a['p1']['raceFont'] and a['p2']['nameFont']>a['p2']['raceFont'])
    ok('avName_4',3.5<=a['p1']['avName']<=5 and 3.5<=a['p2']['avName']<=5)
    ok('nameRace_10',abs(a['p1']['nameRace']-10)<=0.7 and abs(a['p2']['nameRace']-10)<=0.7)
    ok('card_bigger',a['p1']['h']>be['p1']['h'])
    ok('clock_shorter',a['clockH']<be['clockH'])
    ok('headgap_wider',a['headGap']>be['headGap'])
    ok('footer_reason_kept',(a['reason'] is not None)==(be['reason'] is not None))
for k in sorted({x[:-3] for x in c if x.endswith('_ok') or x.endswith('_ng')}):
    print(f"{k}: ok {c[k+'_ok']} ng {c[k+'_ng']}",('  e.g. '+str(bad[k][:3])) if bad[k] else '')
