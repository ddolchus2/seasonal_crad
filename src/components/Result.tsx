import { motion } from 'motion/react';
import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { RESULTS, ResultType } from '../data';
import { Download, Upload, RotateCcw, Palette, RefreshCw, X, Trash2 } from 'lucide-react';
import { toJpeg } from 'html-to-image';
import Cropper from 'react-easy-crop';
import { HexColorPicker } from 'react-colorful';
import { getCroppedImg } from '../utils/cropImage';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ResultProps {
  name: string;
  scores: Record<string, number>;
  onRestart: () => void;
}

function SortableColor({ id, color, onRemove }: { id: string; color: string; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative group touch-none">
      <div 
        className="w-10 h-10 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-200 transition-transform group-hover:scale-95 cursor-grab active:cursor-grabbing"
        style={{ backgroundColor: color }}
      />
      <button 
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
      >
        <X size={12} />
      </button>
    </div>
  );
}

export default function Result({ name, scores, onRestart }: ResultProps) {
  // Image states
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const [isCapturing, setIsCapturing] = useState(false);
  const [customColors, setCustomColors] = useState<{id: string; color: string}[] | null>(null);
  const [draftColor, setDraftColor] = useState<string>('#3B82F6');
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const resultInfo = useMemo(() => {
    const class1 = scores.sp_su > scores.fa_wi ? ['SP', 'SU'] : ['FA', 'WI'];
    const class2 = scores.sp_fa > scores.su_wi ? ['SP', 'FA'] : ['SU', 'WI'];
    
    let season = '';
    if (class1.includes('SP') && class2.includes('SP')) season = 'SP';
    else if (class1.includes('SU') && class2.includes('SU')) season = 'SU';
    else if (class1.includes('FA') && class2.includes('FA')) season = 'FA';
    else if (class1.includes('WI') && class2.includes('WI')) season = 'WI';

    const yinyang = scores.p > scores.n ? 'P' : 'N';
    const resultId = `${season}_${yinyang}` as ResultType;
    return RESULTS[resultId];
  }, [scores]);

  const currentColors = customColors !== null ? customColors : [{ id: 'default', color: resultInfo.color }];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = currentColors.findIndex((c) => c.id === active.id);
      const newIndex = currentColors.findIndex((c) => c.id === over.id);
      const newArray = arrayMove(currentColors, oldIndex, newIndex);
      setCustomColors(newArray);
    }
  };

  // Mobile scaling
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        // max width of card is 805
        setScale(Math.min(1, width / 805));
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Click outside to close color picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showColorPicker]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || '');
        setIsCropping(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = useCallback(async () => {
    try {
      if (imageSrc && croppedAreaPixels) {
        const cropped = await getCroppedImg(imageSrc, croppedAreaPixels);
        setCroppedImage(cropped);
        setIsCropping(false);
      }
    } catch (e) {
      console.error(e);
    }
  }, [imageSrc, croppedAreaPixels]);

  const handleRemoveImage = () => {
    setCroppedImage(null);
    setImageSrc(null);
  };

  const handleAddColor = () => {
    if (currentColors.length < 5) {
      setCustomColors([...currentColors, { id: Date.now().toString(), color: draftColor }]);
    }
  };

  const handleRemoveColor = (idToRemove: string) => {
    const newColors = currentColors.filter((c) => c.id !== idToRemove);
    setCustomColors(newColors);
  };

  const handleResetColors = () => {
    setCustomColors(null);
  };

  const handleDownload = async () => {
    if (!cardRef.current || isCapturing) return;
    try {
      setIsCapturing(true);
      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 100));
      // 저장 속도 단축을 위해 JPEG 포맷 사용
      const dataUrl = await toJpeg(cardRef.current, {
        quality: 0.9, // 인코딩 시간 최적화
        pixelRatio: 1,
      });
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `사계절진단기_${name}_${resultInfo.title}.jpg`;
      link.click();
    } catch (err) {
      console.error('Failed to capture image', err);
      alert('이미지 저장에 실패했습니다.');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 max-w-7xl mx-auto overflow-x-hidden"
    >
      <div className="w-full mb-6">
        <div className="p-6">
          <h2 className="text-xl font-bold text-[#222222] tracking-tight">진단 완료</h2>
          <p className="text-[#777777] text-sm mt-1">결과 카드를 커스텀해보세요</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 w-full items-start justify-center">
        
        {/* Main Result Card Container */}
        <div 
          ref={containerRef}
          className="w-full lg:max-w-[400px] flex justify-center shrink-0 mx-auto"
          style={{ height: 1431 * scale }} // 805x1431 aspect ratio
        >
          <div 
            className="origin-top shrink-0"
            style={{ transform: `scale(${scale})` }}
          >
            {/* The Capture Target */}
            <div 
              ref={cardRef}
              id="result-card" 
              className="w-[805px] h-[1431px] relative flex flex-col items-center py-[80px] overflow-hidden shadow-2xl"
              style={{ backgroundColor: currentColors[0]?.color || '#e2e8f0' }}
            >
              {/* Blurred background if image exists */}
              {croppedImage && (
                <>
                  <div 
                    className="absolute inset-0 bg-cover bg-center scale-110" 
                    style={{ backgroundImage: `url(${croppedImage})`, filter: 'blur(24px)' }} 
                  />
                  <div className="absolute inset-0 bg-white/20 mix-blend-overlay" />
                  <div className="absolute inset-0 bg-black/10" />
                </>
              )}
              {!croppedImage && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-black/5" />
              )}

              {/* Top Text */}
              <div className="relative z-10 text-white/90 text-[24px] font-semibold tracking-[0.2em] uppercase mb-[80px] flex items-center gap-[24px] drop-shadow-md">
                <span className="w-[48px] h-[2px] bg-white/80"></span>
                A Seasonal Theme Card
                <span className="w-[48px] h-[2px] bg-white/80"></span>
              </div>

              {/* Main Polaroid */}
              <div className="relative z-10 bg-white p-[32px] pb-[40px] w-[664px] shadow-[0_40px_100px_rgba(0,0,0,0.2)] flex flex-col">
                <div className="text-center font-black-han text-[72px] mb-[32px] mt-[16px] text-[#222222] tracking-tight leading-none">
                  {name}
                </div>
                
                <div 
                  className="w-full aspect-[4/5] bg-slate-100 bg-cover bg-center mb-[40px]"
                  style={{ 
                    backgroundImage: croppedImage ? `url(${croppedImage})` : 'none',
                    backgroundColor: currentColors[0]?.color || resultInfo.color 
                  }}
                />

                <div className="flex items-start justify-between px-[8px]">
                  <div className="flex gap-[4px]">
                    {currentColors.map((c) => (
                      <div key={c.id} className="w-[48px] h-[48px] shadow-sm" style={{ backgroundColor: c.color }} />
                    ))}
                  </div>
                  <div className="text-right flex flex-col justify-end">
                    <div className="text-[28px] font-bold text-slate-800 mb-[8px] leading-none">{resultInfo.title}</div>
                    <div className="text-[20px] text-slate-500 font-medium leading-tight max-w-[302px] break-keep">
                      {resultInfo.keywords.map(k => `#${k}`).join(' ')}
                    </div>
                  </div>
                </div>
              </div>
              {/* Footer Text */}
              <div className="relative z-10 text-white/80 text-[20px] tracking-widest mt-auto font-medium drop-shadow-md text-center w-full px-[8px]">
                제작자: @ddol_ChuS2
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Control Panels */}
        <div className="flex flex-col w-full max-w-md lg:max-w-[400px] gap-4 shrink-0 mx-auto">
          
          <div className="flex flex-col gap-4">
            {/* Color Settings */}
            <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Palette size={18} className="text-[#777777]" />
                <h3 className="font-bold text-[#222222]">테마 컬러</h3>
              </div>
              <p className="text-xs text-[#777777] mb-4">최대 5개까지 추가 가능. 드래그하여 순서를 변경하거나 X 버튼을 눌러 삭제할 수 있습니다.</p>
              
              <div className="flex items-center gap-2 mb-6 flex-wrap">
                <div className="flex gap-2 flex-wrap">
                  <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext 
                      items={currentColors.map(c => c.id)}
                      strategy={horizontalListSortingStrategy}
                    >
                      {currentColors.map((colorObj) => (
                        <SortableColor 
                          key={colorObj.id} 
                          id={colorObj.id} 
                          color={colorObj.color} 
                          onRemove={() => handleRemoveColor(colorObj.id)} 
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
              </div>

              {currentColors.length < 5 && (
                <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="relative" ref={colorPickerRef}>
                      <button
                        type="button"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="w-10 h-10 rounded-lg border border-slate-200 shadow-sm shrink-0 overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#e1e5fe]"
                        style={{ backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(draftColor) ? draftColor : '#ffffff' }}
                        title="색상 선택"
                      />
                      {showColorPicker && (
                        <div className="absolute top-12 left-0 z-50 p-3 bg-white rounded-xl shadow-xl border border-slate-200">
                          <HexColorPicker color={/^#[0-9A-Fa-f]{6}$/.test(draftColor) ? draftColor : '#ffffff'} onChange={setDraftColor} />
                        </div>
                      )}
                    </div>
                    <input 
                      type="text" 
                      value={draftColor}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (!val.startsWith('#') && val.length > 0) val = '#' + val;
                        setDraftColor(val);
                      }}
                      placeholder="#000000"
                      maxLength={7}
                      className="w-full px-2 py-2 text-sm border border-slate-200 rounded-lg text-center font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#e1e5fe] bg-white text-slate-700"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (/^#[0-9A-Fa-f]{6}$/.test(draftColor) || /^#[0-9A-Fa-f]{3}$/.test(draftColor)) {
                        handleAddColor();
                      } else {
                        alert('올바른 헥스 코드를 입력해주세요. (예: #000000)');
                      }
                    }}
                    className="whitespace-nowrap px-4 py-2 bg-[#e1e5fe] text-[#222222] font-bold rounded-lg hover:bg-[#d0d6fd] transition-colors shadow-sm text-sm"
                  >
                    추가하기
                  </button>
                </div>
              )}

              <div className="mt-auto pt-2 border-t border-slate-100">
                <button
                  onClick={handleResetColors}
                  disabled={customColors === null}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-black/5 text-[#777777] hover:bg-black/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw size={14} />
                  초기화
                </button>
              </div>
            </div>

            {/* Actions Card */}
            <div className="grid grid-cols-2 gap-3">
              <input 
                type="file" 
                accept="image/*"
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <div className="col-span-2 flex gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-4 flex flex-col items-center justify-center gap-1 bg-white text-[#222222] font-bold rounded-[16px] hover:bg-slate-50 transition-colors border border-[#E2E8F0] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]"
                >
                  <Upload size={18} className="text-[#777777] mb-1" />
                  <span className="text-sm">{croppedImage ? '사진 변경' : '사진 추가'}</span>
                </button>

                {croppedImage && (
                  <button
                    onClick={handleRemoveImage}
                    className="flex-1 py-4 flex flex-col items-center justify-center gap-1 bg-red-50 text-red-600 font-bold rounded-[16px] hover:bg-red-100 transition-colors border border-red-100 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]"
                  >
                    <Trash2 size={18} className="mb-1" />
                    <span className="text-sm">사진 삭제</span>
                  </button>
                )}
              </div>
              
              <button
                onClick={handleDownload}
                disabled={isCapturing}
                className="py-4 flex flex-col items-center justify-center gap-1 bg-[#e1e5fe] text-[#222222] font-bold rounded-[16px] hover:bg-[#d0d6fd] transition-colors shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] disabled:opacity-50"
              >
                <Download size={18} className="mb-1" />
                <span className="text-sm">{isCapturing ? '저장 중...' : '결과 저장'}</span>
              </button>

              <button
                onClick={onRestart}
                className="py-4 flex flex-col items-center justify-center gap-1 bg-[#282828] text-white font-bold rounded-[16px] hover:bg-black transition-colors shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]"
              >
                <RotateCcw size={18} className="mb-1" />
                <span className="text-sm">다시하기</span>
              </button>

              <div className="col-span-2 mt-1">
                <p className="w-full text-xs text-[#777777] text-center leading-tight bg-gray-50 rounded-lg py-2 px-3">
                  * 렌더링으로 인해 저장에 다소 시간이 걸릴 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cropper Modal */}
      {isCropping && imageSrc && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-md h-[60vh] bg-black rounded-t-2xl overflow-hidden">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={4 / 5}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div className="w-full max-w-md bg-white rounded-b-2xl p-6 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-500">축소</span>
              <input 
                type="range" min={1} max={3} step={0.1} 
                value={zoom} onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-medium text-slate-500">확대</span>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => { setIsCropping(false); setImageSrc(null); }} 
                className="flex-1 py-3 bg-black/5 text-[#777777] rounded-xl font-bold hover:bg-black/10 transition-colors"
              >
                취소
              </button>
              <button 
                onClick={showCroppedImage} 
                className="flex-1 py-3 bg-[#e1e5fe] text-[#222222] rounded-xl font-bold hover:bg-[#d0d6fd] transition-colors"
              >
                적용하기
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
