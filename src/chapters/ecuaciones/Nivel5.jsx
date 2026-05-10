import EcuacionGameFree from './EcuacionGameFree'
import { generateLevel5 } from './EcuacionEngine'
import { useLang } from '../../i18n/LanguageContext'

export default function Nivel5() {
  const { t } = useLang()
  return (
    <EcuacionGameFree
      generator={generateLevel5}
      title={t.ecuaciones.level5.title}
      tutorialSlides={t.ecuaciones.level5.slides}
    />
  )
}
