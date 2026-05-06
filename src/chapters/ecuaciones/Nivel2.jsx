import EcuacionGame from './EcuacionGame'
import { generateLevel2 } from './EcuacionEngine'
import { useLang } from '../../i18n/LanguageContext'

export default function Nivel2() {
  const { t } = useLang()
  return (
    <EcuacionGame
      level={2}
      generator={generateLevel2}
      title={t.ecuaciones.level2.title}
      tutorialSlides={t.ecuaciones.level2.slides}
    />
  )
}
