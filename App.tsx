import React, { useState, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import Spinner from './components/Spinner';
import { PersonIcon, ShirtIcon, SparklesIcon, PantsIcon } from './components/icons';
import type { ImageData } from './types';
import { performVirtualTryOn } from './services/geminiService';

const App: React.FC = () => {
  const [personImage, setPersonImage] = useState<ImageData | null>(null);
  const [topImage, setTopImage] = useState<ImageData | null>(null);
  const [bottomImage, setBottomImage] = useState<ImageData | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleTryOn = useCallback(async () => {
    if (!personImage) {
      setError("인물 사진을 업로드해주세요.");
      return;
    }
    if (!topImage && !bottomImage) {
      setError("상의 또는 하의 사진을 하나 이상 업로드해주세요.");
      return;
    }

    setLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const generatedImage = await performVirtualTryOn(personImage, topImage, bottomImage);
      setResultImage(generatedImage);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("예상치 못한 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  }, [personImage, topImage, bottomImage]);
  
  const isButtonDisabled = !personImage || (!topImage && !bottomImage) || loading;

  const renderResultContent = () => {
    if (loading) {
      return <Spinner message="새로운 모습을 만들고 있어요..." />;
    }
    if (error) {
      return <div className="text-center text-red-500 dark:text-red-400">
        <h3 className="font-bold text-lg">이런! 문제가 발생했습니다.</h3>
        <p className="text-sm mt-2">{error}</p>
      </div>;
    }
    if (resultImage) {
      return <img src={resultImage} alt="Virtual try-on result" className="w-full h-full object-contain rounded-lg" />;
    }
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        <SparklesIcon className="mx-auto h-16 w-16" />
        <h3 className="mt-4 text-xl font-semibold">결과가 여기에 표시됩니다</h3>
        <p className="mt-1 text-sm">인물 사진과 하나 이상의 옷 사진을 업로드하고 '가상 피팅'을 클릭하여 결과를 확인하세요.</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900 font-sans">
      <main className="w-full max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden my-8">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Input Panel */}
          <div className="p-8 md:p-12 border-r border-gray-200 dark:border-gray-700">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">AI 패션 가상 피팅</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                모델과 상의/하의 사진을 업로드하여 합성된 모습을 확인하세요!
              </p>
            </header>
            
            <div className="space-y-6">
              <ImageUploader 
                id="person-uploader" 
                label="1. 인물 사진 업로드"
                icon={<PersonIcon className="w-12 h-12" />}
                onImageChange={setPersonImage} 
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ImageUploader 
                  id="top-uploader"
                  label="2. 상의 사진 (선택)"
                  icon={<ShirtIcon className="w-12 h-12" />}
                  onImageChange={setTopImage} 
                />
                <ImageUploader 
                  id="bottom-uploader"
                  label="3. 하의 사진 (선택)"
                  icon={<PantsIcon className="w-12 h-12" />}
                  onImageChange={setBottomImage} 
                />
              </div>

              <button
                onClick={handleTryOn}
                disabled={isButtonDisabled}
                className="w-full mt-4 bg-primary-600 text-white font-bold py-4 px-6 rounded-lg text-lg hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-800 transition-all duration-300 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? '생성 중...' : '가상 피팅'}
                <SparklesIcon className="w-5 h-5"/>
              </button>
            </div>
          </div>

          {/* Output Panel */}
          <div className="p-8 md:p-12 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center">
             <div className="w-full aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center p-4">
              {renderResultContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;