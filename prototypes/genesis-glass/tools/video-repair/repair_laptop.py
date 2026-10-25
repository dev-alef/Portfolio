"""Local planar composition for the supplied 24 fps Genesis film.
Requires numpy, opencv-python-headless and ffmpeg. Does not modify the source.
Coordinates are hand-checked in 960x540; optical flow refines intermediate frames.
"""
import argparse, hashlib, json, subprocess
from pathlib import Path
import cv2
import numpy as np

ANCHORS = {
48:[[469,308],[483,308],[480,317],[466,318]],
72:[[472,318],[491,318],[487,332],[468,332]],
96:[[475,330],[502,329],[496,349],[470,350]],
120:[[479,322],[524,321],[515,355],[468,358]],
144:[[489,290],[589,286],[562,357],[464,372]],
162:[[499,255],[691,254],[632,392],[442,427]],
168:[[511,243],[743,243],[674,412],[436,464]],
174:[[486,199],[750,208],[708,431],[430,497]],
176:[[424,164],[705,189],[722,432],[422,502]],
177:[[390,166],[680,187],[728,433],[417,510]],
178:[[352,174],[653,194],[731,438],[407,520]],
179:[[318,195],[625,210],[735,438],[402,527]],
180:[[288,223],[619,225],[739,436],[397,535]],
}

def track(frames):
    grays=[cv2.cvtColor(f,cv2.COLOR_BGR2GRAY) for f in frames]
    quads={}
    keys=sorted(ANCHORS)
    for a,b in zip(keys,keys[1:]):
        q=np.float32(ANCHORS[a]); estimates=[q.copy()]
        for n in range(a,b):
            mask=np.zeros(grays[n].shape,np.uint8)
            center=q.mean(axis=0)
            cv2.fillConvexPoly(mask,np.int32(center+(q-center)*.92),255)
            pts=cv2.goodFeaturesToTrack(grays[n],120,.01,3,mask=mask)
            h=None
            if pts is not None and len(pts)>=6:
                nxt,valid,_=cv2.calcOpticalFlowPyrLK(grays[n],grays[n+1],pts,None,winSize=(21,21),maxLevel=3)
                back,good,_=cv2.calcOpticalFlowPyrLK(grays[n+1],grays[n],nxt,None,winSize=(21,21),maxLevel=3)
                keep=(valid.ravel()==1)&(good.ravel()==1)&(np.linalg.norm(pts-back,axis=2).ravel()<1.5)
                if keep.sum()>=6:h,_=cv2.findHomography(pts[keep],nxt[keep],cv2.RANSAC,1.8)
            if h is not None:
                candidate=cv2.perspectiveTransform(q[None],h)[0]
                if np.max(np.linalg.norm(candidate-q,axis=1))<65:q=candidate
            estimates.append(q.copy())
        # Anchor correction removes accumulation drift, without jumping at keys.
        correction=np.float32(ANCHORS[b])-estimates[-1]
        for i,q in enumerate(estimates):quads[a+i]=q+correction*(i/(b-a))
    return quads

def make_texture(frame):
    rect=np.float32([[0,0],[639,0],[639,399],[0,399]])
    h=cv2.getPerspectiveTransform(np.float32(ANCHORS[180]),rect)
    texture=cv2.warpPerspective(frame,h,(640,400))
    # Remove the hand from the reusable lid plate, preserving it in live frames.
    yy,xx=np.mgrid[0:400,0:640].astype(np.float32)
    x=xx/640;y=yy/400
    basis=np.stack([np.ones_like(x),x,y,x*y,x*x,y*y],axis=-1)
    safe=(xx>25)&(xx<610)&(yy>25)&(yy<345)&~((xx>470)&(yy<190))
    sample=safe&~((xx>265)&(xx<380)&(yy>150)&(yy<255))
    coefficients=np.linalg.lstsq(basis[sample][::7],texture[sample][::7],rcond=None)[0]
    surface=np.clip(basis@coefficients,0,255)
    blend=cv2.GaussianBlur(safe.astype(np.float32),(0,0),10)[:,:,None]
    texture=np.uint8(texture*blend+surface*(1-blend))
    return texture,rect

def composite(frame,q,texture,rect,n):
    scale=frame.shape[1]/960
    q=q*scale
    h=cv2.getPerspectiveTransform(rect,np.float32(q))
    size=(frame.shape[1],frame.shape[0])
    plate=cv2.warpPerspective(texture,h,size,flags=cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)
    mask=np.zeros(frame.shape[:2],np.float32)
    cv2.fillConvexPoly(mask,np.int32(np.round(q)),1,lineType=cv2.LINE_AA)
    # Match soft focus during the closing action and antialias the perimeter.
    sigma=.55*scale if n<172 else 1.05*scale
    mask=cv2.GaussianBlur(mask,(0,0),sigma)
    plate=cv2.GaussianBlur(plate,(0,0),max(.35,sigma*.65))
    light=.76+.24*np.clip((n-168)/12,0,1)
    plate=plate.astype(np.float32)*light
    # Occlusion: the fingers overlap only the upper-right part of the lid.
    region=np.zeros((400,640),np.uint8);region[:155,510:]=255
    region=cv2.warpPerspective(region,h,size)
    ycc=cv2.cvtColor(frame,cv2.COLOR_BGR2YCrCb)
    skin=((ycc[:,:,1]>135)&(ycc[:,:,2]<132)&(region>0)).astype(np.float32)
    skin=cv2.dilate(skin,np.ones((3,3),np.uint8))
    skin=cv2.GaussianBlur(skin,(0,0),.7*scale)
    shadow=cv2.GaussianBlur(skin,(0,0),3*scale)
    plate*=1-.20*shadow[:,:,None]
    mask*=1-skin
    # Original distant lid is subpixel: fade in across the first small frames.
    mask*=min(1,max(0,(n-48)/12))
    return np.uint8(np.clip(frame*(1-mask[:,:,None])+plate*mask[:,:,None],0,255))

def main():
    p=argparse.ArgumentParser();p.add_argument('source');p.add_argument('output');p.add_argument('--preview',action='store_true');args=p.parse_args()
    source=Path(args.source);output=Path(args.output)
    if source.resolve()==output.resolve():raise ValueError('Output must be a copy')
    before=hashlib.sha256(source.read_bytes()).hexdigest()
    cap=cv2.VideoCapture(str(source));fps=cap.get(cv2.CAP_PROP_FPS)
    assert abs(fps-24)<.001
    frames=[]
    for n in range(181):
        ok,f=cap.read();assert ok
        frames.append(cv2.resize(f,(960,540)))
    quads=track(frames);texture,rect=make_texture(frames[180])
    output.parent.mkdir(parents=True,exist_ok=True)
    cv2.imwrite(str(output.with_suffix('.plate.jpg')),texture)
    samples=[]
    for n in [96,120,144,162,168,174,176,177,178,179,180]:
        fixed=composite(frames[n],quads[n],texture,rect,n)
        cv2.imwrite(str(output.parent/f'check-{n}.jpg'),fixed)
        pair=np.hstack([frames[n],fixed]);pair=cv2.resize(pair,(960,270))
        cv2.putText(pair,f'{n/24:.3f}s   ORIGINAL | CORRIGIDO',(10,24),0,.6,(255,255,255),1)
        samples.append(pair)
    cv2.imwrite(str(output.with_suffix('.comparison.jpg')),np.vstack(samples))
    width,height=(960,540) if args.preview else (1920,1080)
    cap.set(cv2.CAP_PROP_POS_FRAMES,0)
    cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','bgr24','-s',f'{width}x{height}','-r','24','-i','pipe:0','-i',str(source),'-map','0:v','-map','1:a?','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-c:a','copy','-movflags','+faststart',str(output)]
    enc=subprocess.Popen(cmd,stdin=subprocess.PIPE)
    count=0
    while True:
        ok,f=cap.read()
        if not ok or (args.preview and count>=196):break
        if args.preview:f=cv2.resize(f,(width,height))
        if count in quads and count<180:f=composite(f,quads[count],texture,rect,count)
        enc.stdin.write(f.tobytes());count+=1
    enc.stdin.close();assert enc.wait()==0
    encoded=json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=nb_frames','-of','json',str(output)]))
    assert int(encoded['streams'][0]['nb_frames'])==count,encoded
    after=hashlib.sha256(source.read_bytes()).hexdigest();assert before==after
    output.with_suffix('.json').write_text(json.dumps({'source':str(source),'source_sha256':before,'output':str(output),'frames':count,'fps':fps,'patched_frames':[49,179],'technique':'Tracked planar lid from original frame 180, with finger occlusion mask','anchors':ANCHORS},indent=2))
    print(f'Wrote {output}, {count} frames. Source hash unchanged.',flush=True)
if __name__=='__main__':main()
